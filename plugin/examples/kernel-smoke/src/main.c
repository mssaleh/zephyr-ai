#include <zephyr/kernel.h>
#include <zephyr/sys/printk.h>

int main(void)
{
	printk("zephyr-ai skill example\n");
	k_sleep(K_MSEC(1));
	return 0;
}
