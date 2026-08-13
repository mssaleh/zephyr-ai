---
name: zephyr-networking
description: Build networked Zephyr firmware. Use when adding Wi-Fi, Ethernet, TCP/IP, sockets, MQTT, HTTP, CoAP, LwM2M, TLS, or DNS to a device; configuring the network stack and its buffers; connecting to an access point; or debugging connectivity, DHCP, and socket errors. Covers the minimum working configuration, buffer sizing, the BSD socket API as Zephyr implements it, TLS credentials, and a diagnostic order for a device that will not connect.
license: Apache-2.0
metadata:
  author: zephyr-ai
  version: "0.6.0"
---

# Networking

> Example status: fenced snippets are illustrative unless an immediately preceding `zephyr-ai-example` metadata comment names a verified target and build command.

## Minimum configuration

The network stack needs its layers turned on explicitly, and it will not work
with default buffer counts on anything real:

```kconfig
CONFIG_NETWORKING=y
CONFIG_NET_IPV4=y
CONFIG_NET_IPV6=n                 # off unless needed; it costs RAM
CONFIG_NET_TCP=y
CONFIG_NET_UDP=y
CONFIG_NET_SOCKETS=y
CONFIG_NET_DHCPV4=y
CONFIG_DNS_RESOLVER=y

# Buffers: the usual cause of "works once then stops"
CONFIG_NET_PKT_RX_COUNT=16
CONFIG_NET_PKT_TX_COUNT=16
CONFIG_NET_BUF_RX_COUNT=32
CONFIG_NET_BUF_TX_COUNT=32

CONFIG_NET_MGMT=y
CONFIG_NET_MGMT_EVENT=y
CONFIG_MAIN_STACK_SIZE=4096
CONFIG_HEAP_MEM_POOL_SIZE=16384
```

Under-provisioned packet buffers produce intermittent failures under load rather
than a clear error: sends return `-ENOMEM`, or the stack quietly drops frames. If
throughput collapses after a few seconds, raise these first.

## Wi-Fi

```kconfig
CONFIG_WIFI=y
CONFIG_NET_L2_ETHERNET=y
CONFIG_NET_L2_WIFI_MGMT=y
CONFIG_WIFI_ESP32=y               # or the driver for your silicon
CONFIG_HEAP_MEM_POOL_SIZE=98304   # Wi-Fi wants a large heap
```

```c
#include <zephyr/net/wifi_mgmt.h>
#include <zephyr/net/net_mgmt.h>

static struct wifi_connect_req_params params = {
        .ssid = (const uint8_t *)"my-network",
        .ssid_length = sizeof("my-network") - 1,
        .psk = (const uint8_t *)"secret",
        .psk_length = sizeof("secret") - 1,
        .security = WIFI_SECURITY_TYPE_PSK,
        .channel = WIFI_CHANNEL_ANY,
        .band = WIFI_FREQ_BAND_2_4_GHZ,
};

struct net_if *iface = net_if_get_first_wifi();
int rc = net_mgmt(NET_REQUEST_WIFI_CONNECT, iface, &params, sizeof(params));
```

`net_mgmt` returning 0 means the *request* was accepted, not that you are
connected. Wait for the event:

```c
static struct net_mgmt_event_callback cb;

static void handler(struct net_mgmt_event_callback *cb, uint32_t event,
                    struct net_if *iface)
{
        if (event == NET_EVENT_IPV4_ADDR_ADD) {
                k_sem_give(&net_ready);   /* now you have an address */
        }
}

net_mgmt_init_event_callback(&cb, handler,
                             NET_EVENT_WIFI_CONNECT_RESULT | NET_EVENT_IPV4_ADDR_ADD);
net_mgmt_add_event_callback(&cb);
```

Opening a socket before `NET_EVENT_IPV4_ADDR_ADD` fails with `-ENETDOWN`. Always
gate on the address, not on the association.

## Sockets

Zephyr implements the BSD socket API, so ordinary socket code ports over:

```c
#include <zephyr/net/socket.h>

int sock = zsock_socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
if (sock < 0) {
        LOG_ERR("socket: %d", errno);
        return -errno;
}

struct sockaddr_in addr = {
        .sin_family = AF_INET,
        .sin_port = htons(1883),
};
zsock_inet_pton(AF_INET, "192.168.1.10", &addr.sin_addr);

/* Always set timeouts: a blocking socket on a dead link never returns */
struct timeval tv = { .tv_sec = 10, .tv_usec = 0 };
zsock_setsockopt(sock, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof(tv));

if (zsock_connect(sock, (struct sockaddr *)&addr, sizeof(addr)) < 0) {
        LOG_ERR("connect: %d", errno);
        zsock_close(sock);
        return -errno;
}
```

With `CONFIG_POSIX_API=y` the unprefixed names (`socket`, `connect`) are
available. The `zsock_` forms always work and are unambiguous.

Set `SO_RCVTIMEO` and `SO_SNDTIMEO` on every socket. A firmware device on a
flaky link that blocks forever in `recv` is indistinguishable from a crash, and
is a leading cause of field lockups.

## TLS

Credentials are registered with the stack by tag, then selected per socket:

```kconfig
CONFIG_MBEDTLS=y
CONFIG_NET_SOCKETS_SOCKOPT_TLS=y
CONFIG_MBEDTLS_HEAP_SIZE=32768
CONFIG_TLS_CREDENTIALS=y
```

```c
tls_credential_add(CA_TAG, TLS_CREDENTIAL_CA_CERTIFICATE, ca_cert, sizeof(ca_cert));

int sock = zsock_socket(AF_INET, SOCK_STREAM, IPPROTO_TLS_1_2);
sec_tag_t tags[] = { CA_TAG };
zsock_setsockopt(sock, SOL_TLS, TLS_SEC_TAG_LIST, tags, sizeof(tags));
zsock_setsockopt(sock, SOL_TLS, TLS_HOSTNAME, "example.com", sizeof("example.com"));
```

Set `TLS_HOSTNAME` — without it the certificate's name is not verified, which
defeats most of the point. TLS handshakes need several kilobytes of stack in the
calling thread; a handshake that faults is usually stack, not crypto.

Certificate validation also needs the clock to be roughly right. A device with no
RTC and no NTP will reject valid certificates as not-yet-valid.

## Application protocols

Zephyr ships MQTT, HTTP client and server, CoAP, LwM2M, and WebSocket. Each has a
sample that is CI-built — `search_samples` for it and copy the `prj.conf`, because
the buffer and stack sizing in those samples is tuned.

## Diagnosing a device that will not connect

In order:

1. **Is the interface up?** `net iface` in the shell. Down means a driver or
   devicetree problem, not a network one.
2. **Is there an address?** `net iface` shows it. No address means DHCP never
   completed — check the association first.
3. **Does DNS resolve?** `net dns google.com`. Failure here with a valid address
   means `CONFIG_DNS_RESOLVER` is off or no server was supplied.
4. **Does the route work?** `net ping 8.8.8.8`.
5. **Only then look at the socket code.**

```kconfig
CONFIG_NET_SHELL=y
CONFIG_NET_LOG=y
CONFIG_NET_STATISTICS=y      # `net stats` shows drops and allocation failures
```

`net stats` reporting dropped packets or allocation failures points straight back
to buffer counts.
