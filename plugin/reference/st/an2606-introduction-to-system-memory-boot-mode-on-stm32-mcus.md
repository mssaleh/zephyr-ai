
AN2606
Application note

Introduction to system memory boot mode on STM32 MCUs


### Introduction

This document applies to the products listed in [Table 1](#_bookmark0), referred to as STM32 throughout the document.
It describes the supported peripherals and hardware requirements to consider when using the bootloader, stored in the internal boot ROM (system memory) of STM32 devices, and programmed during production.
Its main task is to download the application program to the internal flash memory through one of the available serial peripherals (such as USART, CAN, USB, I2C, I3C, SPI, FDCAN). A communication protocol is defined for each interface, with a compatible command set and sequence.


**Table** **1.** **Appli**cable** **products**
| Type | Part number or product series |
| --- | --- |
| Microcontrollers | STM32C0 series:	STM32C011xx, STM32C031xx, STM32C051xx, STM32C071xx, STM32C091xx, STM32C092xx STM32C5 series:	STM32C5A3xx, STM32C531xx, STM32C532xx, STM32C542xx, STM32C551xx, STM32C552xx, STM32C562xx, STM32C591xx, STM32C593xx STM32F0 series:	STM32F03xxx, STM32F04xxx, STM32F05xxx, STM32F07xxx, STM32F09xxx STM32F1 series STM32F2 series STM32F3 series: STM32F301xx, STM32F302xx, STM32F303xx, STM32F318xx, STM32F328xx, STM32F334xx, STM32F358xx, STM32F373xx, STM32F378xx, STM32F398xx STM32F4 series: STM32F401xx, STM32F405xx, STM32F407xx, STM32F410xx, STM32F411xx, STM32F412xx, STM32F413xx, STM32F415xx, STM32F417xx, STM32F423xx, STM32F427xx, STM32F429xx, STM32F437xx, STM32F439xx, STM32F446xx, STM32F469xx, STM32F479xx STM32F7 series: STM32F722xx, STM32F723xx, STM32F732xx, STM32F733xx, STM32F745xx, STM32F746xx, STM32F756xx, STM32F765xx, STM32F767xx, STM32F769xx, STM32F777xx, STM32F779xx STM32G0 series:	STM32G030xx, STM32G031xx, STM32G041xx, STM32G07xxx, STM32G08xxx, STM32G0B0xx, STM32G0B1xx, STM32G0C1xx, STM32G050xx, STM32G051xx, STM32G061xx STM32G4 series:	STM32G431xx, STM32G441xx, STM32G47xxx, STM32G48xxx, STM32G491xx, STM32G4A1xx STM32H5 series:	STM32H503xx, STM32H562xx, STM32H563xx, STM32H573xx, STM32H523xx, STM32H533xx, STM32H5E4xx, STM32H5E5xx, STM32H5F4xx, STM32H5F5xx STM32H7 series:	STM32H72xxx, STM32H73xxx, STM32H74xxx, STM32H75xxx, STM32H7A3xx, STM32H7B0xx, STM32H7B3xx, STM32H7R3xx, STM32H7R7xx, STM32H7S3xx, STM32H7S7xx STM32L0 series STM32L1 series:	STM32L100xx, STM32L151xx, STM32L152xx, STM32L162xx STM32L4 series:	STM32L431xx, STM32L432xx, STM32L433xx, STM32L442xx, STM32L443xx, STM32L451xx, STM32L452xx, STM32L462xx, STM32L471xx, STM32L475xx, STM32L476xx, STM32L486xx, STM32L496xx, STM32L4A6xx, STM32L4R5xx, STM32L4R7xx, STM32L4R9xx, STM32L4S5xx, STM32L4S7xx, STM32L4S9xx, STM32L412xx, STM32L422xx, STM32L4P5xx, STM32L4Q5xx, STM32L431xx, STM32L432xx, STM32L433xx, STM32L442xx, STM32L443xx, STM32L451xx, STM32L452xx, STM32L462xx, STM32L471xx, STM32L475xx, STM32L476xx, STM32L486xx, STM32L496xx, STM32L4A6xx, STM32L4R5xx, STM32L4R7xx, STM32L4R9xx, STM32L4S5xx, STM32L4S7xx, STM32L4S9xx, STM32L412xx, STM32L422xx, STM32L4P5xx, STM32L4Q5xx STM32L5 series:	STM32L552xx, STM32L562xx STM32U0 series:	STM32U031xx, STM32U073xx, STM32U083xx STM32U3 series:	STM32U375xx, STM32U385xx, STM32U3B5xx, STM32U3C5xx STM32U5 series: STM32U535xx, STM32U545xx, STM32U575xx, STM32U585xx, STM32U595xx, STM32U599xx, STM32U5A5xx,STM32U5A9xx, STM32U5F7xx, STM32U5F9xx, STM32U5G7xx, STM32U5G9xx STM32WB series: STM32WB10xx, STM32WB15xx, STM32WB30xx, STM32WB35xx, STM32WB50xx, STM32WB55xx STM32WBA series: STM32WBA20xx, STM32WBA23xx, STM32WBA25xx, STM32WBA50xx, STM32WBA52xx, STM32WBA54xx, STM32WBA55xx, STM32WBA62xx, STM32WBA63xx, STM32WBA64xx, STM32WBA65xx STM32WB0 series: STM32WB05xx, STM32WB06xx, STM32WB07xx, STM32WB09xx STM32WL series: STM32WL30xx, STM32WL31xx, STM32WL33xx, STM32WL3Rxx, STM32WLE5xx, STM32WL55xx |


**Contents**

1. [General information	27](#_bookmark2)
1. [Related documents	27](#_bookmark3)
1. [Glossary	28](#_bookmark4)
1. [General bootloader description	34](#_bookmark5)
  1. [Bootloader activation	34](#_bookmark6)
  1. [Bootloader identification	37](#_bookmark9)
  1. [Hardware connection requirements	47](#_bookmark12)
  1. [Bootloader memory management	49](#_bookmark18)
  1. [Bootloader UART baudrate detection	51](#_bookmark21)
  1. [Programming constraints	53](#_bookmark23)
  1. [ExitSecureMemory feature	54](#_bookmark25)
    1. [ExitSecureMemory v1.0	54](#_bookmark26)
    1. [ExitSecureMemory v1.1	56](#_bookmark29)
  1. [IWDG usage	57](#_bookmark32)
  1. [Bootloader models	57](#_bookmark33)
  1. [Boot constraints on BL	58](#_bookmark35)
1. [STM32C011xx devices	61](#_bookmark40)
  1. [Bootloader configuration	61](#_bookmark41)
  1. [Bootloader selection	62](#_bookmark43)
  1. [Bootloader version	62](#_bookmark45)
1. [STM32C031xx devices	63](#_bookmark47)
  1. [Bootloader configuration	63](#_bookmark48)
  1. [Bootloader selection	64](#_bookmark50)
  1. [Bootloader version	64](#_bookmark52)
1. [STM32C051xx devices	65](#_bookmark54)
  1. [Bootloader configuration	65](#_bookmark55)
  1. [Boot model	67](#_bookmark58)
  1. [Bootloader selection	68](#_bookmark59)
  1. [Bootloader version	69](#_bookmark61)
1. [STM32C071xx devices	70](#_bookmark63)
  1. [Bootloader configuration	70](#_bookmark64)
  1. [Bootloader selection	72](#_bookmark68)
  1. [Bootloader version	72](#_bookmark70)
1. [STM32C091xx/92xx devices	74](#_bookmark72)
  1. [Bootloader configuration	74](#_bookmark73)
  1. [Boot model	76](#_bookmark76)
  1. [Bootloader selection	77](#_bookmark77)
  1. [Bootloader version	78](#_bookmark79)
1. [STM32C531xx/532xx/542xx devices	79](#_bookmark81)
  1. [Bootloader configuration	79](#_bookmark82)
  1. [Bootloader selection	82](#_bookmark86)
  1. [Bootloader version	83](#_bookmark88)
1. [STM32C55xxx/562xx devices	84](#_bookmark90)
  1. [Bootloader configuration	84](#_bookmark91)
  1. [Bootloader selection	87](#_bookmark94)
  1. [Bootloader version	87](#_bookmark96)
1. [STM32C5A3xx/59xxx devices	88](#_bookmark98)
  1. [Bootloader configuration	88](#_bookmark99)
  1. [Bootloader selection	91](#_bookmark102)
  1. [Bootloader version	91](#_bookmark104)
1. [STM32F03xx4/6 devices	92](#_bookmark106)
  1. [Bootloader configuration	92](#_bookmark107)
  1. [Bootloader selection	93](#_bookmark109)
  1. [Bootloader version	93](#_bookmark111)
1. [STM32F030xC devices	94](#_bookmark113)
  1. [Bootloader configuration	94](#_bookmark114)
  1. [Bootloader selection	95](#_bookmark116)
  1. [Bootloader version	95](#_bookmark118)
1. [STM32F05xxx and STM32F030x8 devices	96](#_bookmark120)
  1. [Bootloader configuration	96](#_bookmark121)
  1. [Bootloader selection	97](#_bookmark123)
  1. [Bootloader version	97](#_bookmark125)
1. [STM32F04xxx devices	98](#_bookmark127)
  1. [Bootloader configuration	98](#_bookmark128)
  1. [Bootloader selection	100](#_bookmark130)
  1. [Bootloader version	101](#_bookmark132)
1. [STM32F070x6 devices	102](#_bookmark134)
  1. [Bootloader configuration	102](#_bookmark135)
  1. [Bootloader selection	104](#_bookmark137)
  1. [Bootloader version	105](#_bookmark139)
1. [STM32F070xB devices	106](#_bookmark141)
  1. [Bootloader configuration	106](#_bookmark142)
  1. [Bootloader selection	108](#_bookmark144)
  1. [Bootloader version	109](#_bookmark146)
1. [STM32F071xx/072xx devices	110](#_bookmark148)
  1. [Bootloader configuration	110](#_bookmark149)
  1. [Bootloader selection	112](#_bookmark151)
  1. [Bootloader version	112](#_bookmark153)
1. [STM32F09xxx devices	114](#_bookmark155)
  1. [Bootloader configuration	114](#_bookmark156)
  1. [Bootloader selection	115](#_bookmark158)
  1. [Bootloader version	115](#_bookmark160)
1. [STM32F10xxx devices	116](#_bookmark162)
  1. [Bootloader configuration	116](#_bookmark163)
  1. [Bootloader selection	117](#_bookmark165)
  1. [Bootloader version	117](#_bookmark167)
1. [STM32F105xx/107xx devices	119](#_bookmark169)
  1. [Bootloader configuration	119](#_bookmark170)
  1. [Bootloader selection	121](#_bookmark172)
  1. [Bootloader version	122](#_bookmark174)
    1. [How to identify STM32F105xx/107xx bootloader versions	122](#_bookmark177)
    1. [Bootloader unavailability on STM32F105xx/STM32F107xx devices](#_bookmark178)
[with date code lower than 937	123](#_bookmark178)
    1. [USART bootloader Get-Version command returns 0x20](#_bookmark179)
[instead of 0x22	123](#_bookmark179)
    1. [PA9 excessive power consumption when USB cable is plugged](#_bookmark180)
[in bootloader V2.0	124](#_bookmark180)
1. [STM32F10xxx XL-density devices	125](#_bookmark181)
  1. [Bootloader configuration	125](#_bookmark182)
  1. [Bootloader selection	126](#_bookmark184)
  1. [Bootloader version	126](#_bookmark186)
1. [STM32F2xxxx devices	127](#_bookmark188)
  1. [Bootloader V2.x	127](#_bookmark189)
    1. [Bootloader configuration	127](#_bookmark190)
    1. [Bootloader selection	128](#_bookmark192)
    1. [Bootloader version	129](#_bookmark194)
  1. [Bootloader V3.x	130](#_bookmark196)
    1. [Bootloader configuration	130](#_bookmark197)
    1. [Bootloader selection	132](#_bookmark199)
    1. [Bootloader version	133](#_bookmark201)
1. [STM32F301xx/302x4(6/8) devices	134](#_bookmark203)
  1. [Bootloader configuration	134](#_bookmark204)
  1. [Bootloader selection	136](#_bookmark206)
  1. [Bootloader version	137](#_bookmark208)
1. [STM32F302xB(C)/303xB(C) devices	138](#_bookmark210)
  1. [Bootloader configuration	138](#_bookmark211)
  1. [Bootloader selection	140](#_bookmark213)
  1. [Bootloader version	140](#_bookmark215)
1. [STM32F302xD(E)/303xD(E) devices	141](#_bookmark217)
  1. [Bootloader configuration	141](#_bookmark218)
  1. [Bootloader selection	143](#_bookmark220)
  1. [Bootloader version	144](#_bookmark222)
1. [STM32F303x4(6/8)/334xx/328xx devices	145](#_bookmark224)
  1. [Bootloader configuration	145](#_bookmark225)
  1. [Bootloader selection	146](#_bookmark227)
  1. [Bootloader version	146](#_bookmark229)
1. [STM32F318xx devices	147](#_bookmark231)
  1. [Bootloader configuration	147](#_bookmark232)
  1. [Bootloader selection	148](#_bookmark234)
  1. [Bootloader version	149](#_bookmark236)
1. [STM32F358xx devices	150](#_bookmark238)
  1. [Bootloader configuration	150](#_bookmark239)
  1. [Bootloader selection	151](#_bookmark241)
  1. [Bootloader version	151](#_bookmark243)
1. [STM32F373xx devices	152](#_bookmark245)
  1. [Bootloader configuration	152](#_bookmark246)
  1. [Bootloader selection	154](#_bookmark248)
  1. [Bootloader version	154](#_bookmark250)
1. [STM32F378xx devices	156](#_bookmark252)
  1. [Bootloader configuration	156](#_bookmark253)
  1. [Bootloader selection	157](#_bookmark255)
  1. [Bootloader version	157](#_bookmark257)
1. [STM32F398xx devices	158](#_bookmark259)
  1. [Bootloader configuration	158](#_bookmark260)
  1. [Bootloader selection	159](#_bookmark262)
  1. [Bootloader version	160](#_bookmark264)
1. [STM32F40xxx/41xxx devices	161](#_bookmark266)
  1. [Bootloader V3.x	161](#_bookmark267)
    1. [Bootloader configuration	161](#_bookmark268)
    1. [Bootloader selection	163](#_bookmark270)
    1. [Bootloader version	164](#_bookmark272)
  1. [Bootloader V9.x	164](#_bookmark274)
    1. [Bootloader configuration	164](#_bookmark275)
    1. [Bootloader selection	168](#_bookmark278)
    1. [Bootloader version	169](#_bookmark280)
1. [STM32F401xB(C) devices	170](#_bookmark282)
  1. [Bootloader configuration	170](#_bookmark283)
  1. [Bootloader selection	173](#_bookmark285)
  1. [Bootloader version	174](#_bookmark287)
1. [STM32F401xD(E) devices	175](#_bookmark289)
  1. [Bootloader configuration	175](#_bookmark290)
  1. [Bootloader selection	178](#_bookmark292)
  1. [Bootloader version	179](#_bookmark294)
1. [STM32F410xx devices	180](#_bookmark296)
  1. [Bootloader configuration	180](#_bookmark297)
  1. [Bootloader selection	183](#_bookmark299)
  1. [Bootloader version	184](#_bookmark301)
1. [STM32F411xx devices	185](#_bookmark303)
  1. [Bootloader configuration	185](#_bookmark304)
  1. [Bootloader selection	188](#_bookmark306)
  1. [Bootloader version	189](#_bookmark308)
1. [STM32F412xx devices	190](#_bookmark310)
  1. [Bootloader configuration	190](#_bookmark311)
  1. [Bootloader selection	194](#_bookmark313)
  1. [Bootloader version	195](#_bookmark315)
1. [STM32F413xx/423xx devices	196](#_bookmark317)
  1. [Bootloader configuration	196](#_bookmark318)
  1. [Bootloader selection	200](#_bookmark320)
  1. [Bootloader version	201](#_bookmark322)
1. [STM32F42xxx/43xxx devices	202](#_bookmark324)
  1. [Bootloader V7.x	202](#_bookmark325)
    1. [Bootloader configuration	202](#_bookmark326)
    1. [Bootloader selection	205](#_bookmark328)
    1. [Bootloader version	207](#_bookmark331)
  1. [Bootloader V9.x	208](#_bookmark333)
    1. [Bootloader configuration	208](#_bookmark334)
    1. [Bootloader selection	212](#_bookmark336)
    1. [Bootloader version	214](#_bookmark339)
1. [STM32F446xx devices	215](#_bookmark341)
  1. [Bootloader configuration	215](#_bookmark342)
  1. [Bootloader selection	219](#_bookmark344)
  1. [Bootloader version	220](#_bookmark346)
1. [STM32F469xx/479xx devices	221](#_bookmark348)
  1. [Bootloader configuration	221](#_bookmark349)
  1. [Bootloader selection	225](#_bookmark351)
  1. [Bootloader version	227](#_bookmark354)
1. [STM32F72xxx/73xxx devices	228](#_bookmark356)
  1. [Bootloader configuration	228](#_bookmark357)
  1. [Bootloader selection	232](#_bookmark359)
  1. [Bootloader version	233](#_bookmark361)
1. [STM32F74xxx/75xxx devices	234](#_bookmark363)
  1. [Bootloader V7.x	234](#_bookmark364)
    1. [Bootloader configuration	234](#_bookmark365)
    1. [Bootloader selection	237](#_bookmark367)
    1. [Bootloader version	237](#_bookmark369)
  1. [Bootloader V9.x	238](#_bookmark371)
    1. [Bootloader configuration	238](#_bookmark372)
    1. [Bootloader selection	242](#_bookmark374)
    1. [Bootloader version	243](#_bookmark376)
1. [STM32F76xxx/77xxx devices	244](#_bookmark378)
  1. [Bootloader configuration	244](#_bookmark379)
  1. [Bootloader selection	248](#_bookmark381)
  1. [Bootloader version	250](#_bookmark384)
1. [STM32G03xxx/STM32G04xxx devices	251](#_bookmark386)
  1. [Bootloader configuration	251](#_bookmark387)
  1. [Bootloader selection	252](#_bookmark389)
  1. [Bootloader version	253](#_bookmark391)
1. [STM32G07xxx/08xxx device bootloader	254](#_bookmark393)
  1. [Bootloader configuration	254](#_bookmark394)
  1. [Bootloader selection	257](#_bookmark397)
  1. [Bootloader version	257](#_bookmark399)
    1. [Compatibility break on boot sequence	259](#_bookmark401)
1. [STM32G0B0xx device bootloader	260](#_bookmark402)
  1. [Bootloader configuration	260](#_bookmark403)
  1. [Bootloader selection	263](#_bookmark406)
  1. [Bootloader version	264](#_bookmark408)
1. [STM32G0B1xx/0C1xx device bootloader	265](#_bookmark410)
  1. [Bootloader configuration	265](#_bookmark411)
  1. [Bootloader selection	268](#_bookmark414)
  1. [Bootloader version	269](#_bookmark416)
1. [STM32G05xxx/061xx devices	270](#_bookmark418)
  1. [Bootloader configuration	270](#_bookmark419)
  1. [Bootloader selection	272](#_bookmark421)
  1. [Bootloader version	272](#_bookmark423)
1. [STM32G431xx/441xx devices	274](#_bookmark425)
  1. [Bootloader configuration	274](#_bookmark426)
  1. [Bootloader selection	277](#_bookmark429)
  1. [Bootloader version	278](#_bookmark431)
1. [STM32G47xxx/48xxx devices	279](#_bookmark433)
  1. [Bootloader configuration	279](#_bookmark434)
  1. [Bootloader selection	282](#_bookmark437)
  1. [Bootloader version	283](#_bookmark440)
1. [STM32G491xx/4A1xx devices	285](#_bookmark442)
  1. [Bootloader configuration	285](#_bookmark443)
  1. [Bootloader selection	288](#_bookmark446)
  1. [Bootloader version	289](#_bookmark448)
1. [STM32H503xx devices	290](#_bookmark450)
  1. [Bootloader configuration	290](#_bookmark451)
  1. [Bootloader selection	294](#_bookmark454)
  1. [Bootloader version	295](#_bookmark456)
1. [STM32H523xx/533xx devices	296](#_bookmark458)
  1. [Bootloader configuration	296](#_bookmark459)
  1. [Bootloader selection	301](#_bookmark462)
  1. [Bootloader version	302](#_bookmark464)
1. [STM32H562xx/563xx/573xx devices	303](#_bookmark466)
  1. [Bootloader configuration	303](#_bookmark467)
  1. [Bootloader selection	307](#_bookmark470)
  1. [Bootloader version	308](#_bookmark472)
1. [STM32H5Ex/5Fx devices	309](#_bookmark474)
  1. [Bootloader configuration	309](#_bookmark475)
  1. [Bootloader selection	312](#_bookmark478)
  1. [Bootloader version	313](#_bookmark480)
1. [STM32H72xxx/73xxx devices	314](#_bookmark482)
  1. [Bootloader configuration	314](#_bookmark483)
  1. [Bootloader selection	318](#_bookmark485)
  1. [Bootloader version	319](#_bookmark487)
1. [STM32H74xxx/75xxx devices	320](#_bookmark489)
  1. [Bootloader configuration	320](#_bookmark490)
  1. [Bootloader selection	324](#_bookmark493)
  1. [Bootloader version	325](#_bookmark495)
1. [STM32H7A3xx/7B3xx/7B0xx devices	328](#_bookmark497)
  1. [Bootloader configuration	328](#_bookmark498)
  1. [Bootloader selection	333](#_bookmark500)
  1. [Bootloader version	334](#_bookmark502)
1. [STM32H7Rxxx/7Sxxx devices	335](#_bookmark504)
  1. [Bootloader configuration	335](#_bookmark505)
  1. [Bootloader selection	340](#_bookmark509)
  1. [Bootloader version	341](#_bookmark511)
  1. [Jump to bootloader	341](#_bookmark513)
1. [STM32L01xxx/02xxx devices	342](#_bookmark514)
  1. [Bootloader configuration	342](#_bookmark515)
  1. [Bootloader selection	344](#_bookmark518)
  1. [Bootloader version	345](#_bookmark520)
1. [STM32L031xx/041xx devices	346](#_bookmark522)
  1. [Bootloader configuration	346](#_bookmark523)
  1. [Bootloader selection	348](#_bookmark525)
  1. [Bootloader version	348](#_bookmark527)
1. [STM32L05xxx/06xxx devices	349](#_bookmark529)
  1. [Bootloader configuration	349](#_bookmark530)
  1. [Bootloader selection	351](#_bookmark532)
  1. [Bootloader version	351](#_bookmark534)
1. [STM32L07xxx/08xxx devices	352](#_bookmark536)
  1. [Bootloader V4.x	352](#_bookmark537)
    1. [Bootloader configuration	352](#_bookmark538)
    1. [Bootloader selection	354](#_bookmark540)
    1. [Bootloader version	355](#_bookmark543)
  1. [Bootloader V11.x	357](#_bookmark545)
    1. [Bootloader configuration	357](#_bookmark546)
    1. [Bootloader selection	359](#_bookmark548)
    1. [Bootloader version	360](#_bookmark551)
1. [STM32L1xxx6(8/B)A devices	361](#_bookmark553)
  1. [Bootloader configuration	361](#_bookmark554)
  1. [Bootloader selection	362](#_bookmark556)
  1. [Bootloader version	362](#_bookmark558)
1. [STM32L1xxx6(8/B) devices	363](#_bookmark560)
  1. [Bootloader configuration	363](#_bookmark561)
  1. [Bootloader selection	364](#_bookmark563)
  1. [Bootloader version	364](#_bookmark565)
1. [STM32L1xxxC devices	365](#_bookmark567)
  1. [Bootloader configuration	365](#_bookmark568)
  1. [Bootloader selection	367](#_bookmark570)
  1. [Bootloader version	368](#_bookmark572)
1. [STM32L1xxxD devices	369](#_bookmark574)
  1. [Bootloader configuration	369](#_bookmark575)
  1. [Bootloader selection	371](#_bookmark577)
  1. [Bootloader version	372](#_bookmark579)
1. [STM32L1xxxE devices	373](#_bookmark581)
  1. [Bootloader configuration	373](#_bookmark582)
  1. [Bootloader selection	375](#_bookmark584)
  1. [Bootloader version	376](#_bookmark586)
1. [STM32L412xx/422xx devices	377](#_bookmark588)
  1. [Bootloader configuration	377](#_bookmark589)
  1. [Bootloader selection	380](#_bookmark593)
  1. [Bootloader version	382](#_bookmark596)
1. [STM32L43xxx/44xxx devices	383](#_bookmark598)
  1. [Bootloader configuration	383](#_bookmark599)
  1. [Bootloader selection	387](#_bookmark602)
  1. [Bootloader version	389](#_bookmark605)
1. [STM32L45xxx/46xxx devices	391](#_bookmark607)
  1. [Bootloader configuration	391](#_bookmark608)
  1. [Bootloader selection	395](#_bookmark611)
  1. [Bootloader version	397](#_bookmark614)
1. [STM32L47xxx/48xxx devices	398](#_bookmark616)
  1. [Bootloader V10.x	398](#_bookmark617)
    1. [Bootloader configuration	398](#_bookmark618)
    1. [Bootloader selection	401](#_bookmark620)
    1. [Bootloader version	403](#_bookmark623)
  1. [Bootloader V9.x	404](#_bookmark625)
    1. [Bootloader configuration	404](#_bookmark626)
    1. [Bootloader selection	407](#_bookmark630)
    1. [Bootloader version	409](#_bookmark633)
1. [STM32L496xx/4A6xx devices	410](#_bookmark635)
  1. [Bootloader configuration	410](#_bookmark636)
  1. [Bootloader selection	414](#_bookmark639)
  1. [Bootloader version	416](#_bookmark642)
1. [STM32L4P5xx/4Q5xx devices	417](#_bookmark644)
  1. [Bootloader configuration	417](#_bookmark645)
  1. [Bootloader selection	421](#_bookmark647)
  1. [Bootloader version	423](#_bookmark650)
1. [STM32L4Rxxx/4Sxxx devices	424](#_bookmark652)
  1. [Bootloader configuration	424](#_bookmark653)
  1. [Bootloader selection	428](#_bookmark655)
  1. [Bootloader version	430](#_bookmark658)
1. [STM32L552xx/62xx devices	431](#_bookmark660)
  1. [Bootloader configuration	431](#_bookmark661)
  1. [Bootloader selection	435](#_bookmark664)
  1. [Bootloader version	436](#_bookmark666)
1. [STM32WB10xx/15xx devices	437](#_bookmark668)
  1. [Bootloader configuration	437](#_bookmark669)
  1. [Bootloader selection	439](#_bookmark671)
  1. [Bootloader version	440](#_bookmark673)
1. [STM32WB30xx/35xx/50xx/55xx devices	441](#_bookmark675)
  1. [Bootloader configuration	441](#_bookmark676)
  1. [Bootloader selection	444](#_bookmark678)
  1. [Bootloader version	445](#_bookmark680)
1. [STM32WBA5xxx devices	446](#_bookmark682)
  1. [Bootloader configuration	446](#_bookmark683)
  1. [Bootloader selection	448](#_bookmark686)
  1. [Bootloader version	449](#_bookmark688)
1. [STM32WBA2xxx devices	450](#_bookmark690)
  1. [Bootloader configuration	450](#_bookmark691)
  1. [Bootloader selection	454](#_bookmark694)
  1. [Bootloader version	455](#_bookmark696)
1. [STM32WBA62xx/63xx/64xx/65xx devices	456](#_bookmark698)
  1. [Bootloader configuration	456](#_bookmark699)
  1. [Bootloader selection	459](#_bookmark702)
  1. [Bootloader version	459](#_bookmark704)
1. [STM32WB05xx devices	460](#_bookmark706)
  1. [Bootloader configuration	460](#_bookmark707)
  1. [Bootloader selection	461](#_bookmark709)
  1. [Bootloader version	461](#_bookmark711)
1. [STM32WB06xx/07xx devices	462](#_bookmark713)
  1. [Bootloader configuration	462](#_bookmark714)
  1. [Bootloader selection	463](#_bookmark716)
  1. [Bootloader version	463](#_bookmark718)
1. [STM32WB09xx devices	464](#_bookmark720)
  1. [Bootloader configuration	464](#_bookmark721)
  1. [Bootloader selection	465](#_bookmark723)
  1. [Bootloader version	465](#_bookmark725)
1. [STM32WL3xxx devices	466](#_bookmark727)
  1. [Bootloader configuration	466](#_bookmark728)
  1. [Bootloader selection	467](#_bookmark730)
  1. [Bootloader version	467](#_bookmark732)
1. [STM32WLE5xx/55xx devices	468](#_bookmark734)
  1. [Bootloader configuration	468](#_bookmark735)
  1. [Bootloader selection	470](#_bookmark737)
  1. [Bootloader version	470](#_bookmark739)
1. [STM32U031xx devices	471](#_bookmark741)
  1. [Bootloader configuration	471](#_bookmark742)
  1. [Bootloader selection	474](#_bookmark745)
  1. [Bootloader version	475](#_bookmark747)
1. [STM32U073xx/83xx devices	476](#_bookmark749)
  1. [Bootloader configuration	476](#_bookmark750)
  1. [Bootloader selection	479](#_bookmark753)
  1. [Bootloader version	480](#_bookmark755)
1. [STM32U375xx/85xx devices	481](#_bookmark757)
  1. [Bootloader configuration	481](#_bookmark758)
  1. [SPI1 pinout on WLCSP68-G	484](#_bookmark761)
  1. [Boot model	484](#_bookmark762)
  1. [Bootloader selection	486](#_bookmark764)
  1. [Bootloader version	487](#_bookmark766)
1. [STM32U3B5xx/3C5xx devices	488](#_bookmark768)
  1. [Bootloader configuration	488](#_bookmark769)
  1. [Bootloader selection	493](#_bookmark773)
  1. [Bootloader version	494](#_bookmark775)
1. [STM32U535xx/545xx devices	495](#_bookmark777)
  1. [Bootloader configuration	495](#_bookmark778)
  1. [Bootloader selection	499](#_bookmark781)
  1. [Bootloader version	500](#_bookmark783)
1. [STM32U575xx/85xx devices	501](#_bookmark785)
  1. [Bootloader configuration	501](#_bookmark786)
  1. [Bootloader selection	505](#_bookmark789)
  1. [Bootloader version	506](#_bookmark791)
1. [STM32U595xx/99xx/A5xx/A9xx devices	507](#_bookmark793)
  1. [Bootloader configuration	507](#_bookmark794)
  1. [Bootloader selection	511](#_bookmark797)
  1. [Bootloader version	511](#_bookmark799)
1. [STM32U5F7xx/F9xx/G7xx/G9xx devices	512](#_bookmark801)
  1. [Bootloader configuration	512](#_bookmark802)
  1. [Bootloader selection	516](#_bookmark805)
  1. [Bootloader version	516](#_bookmark807)
1. [Device-dependent bootloader parameters	517](#_bookmark809)
1. [Bootloader timings	524](#_bookmark811)
  1. [Bootloader startup timing	524](#_bookmark812)
  1. [USART connection timing	527](#_bookmark815)
  1. [USB connection timing	531](#_bookmark818)
  1. [I2C connection timing	533](#_bookmark821)
  1. [SPI connection timing	537](#_bookmark824)
[Appendix A	Example of ExitSecureMemory v1.0 function	538](#_bookmark827)
[Appendix B	Example of ExitSecureMemory v1.1 function	540](#_bookmark828)
1. [Revision history	543](#_bookmark829)






[Table 1.	Applicable products	2](#_bookmark0)
[Table 2.	Bootloader activation patterns	34](#_bookmark7)
[Table 3.	Embedded bootloaders	39](#_bookmark11)
[Table 4.	STM32 F2, F4, and F7 voltage range configuration using bootloader	50](#_bookmark19)
[Table 5.	Supported memory area by Write, Read, Erase, and Go commands	51](#_bookmark20)
[Table 6.	Jitter software calculation on bootloader USART detection	52](#_bookmark22)
[Table 7.	Flash memory alignment constraints	53](#_bookmark24)
[Table 8.	ExitSecureMemory entry address	57](#_bookmark31)
[Table 9.	BL and boot by product series	59](#_bookmark36)
[Table 10.	STM32C011xx configuration in system memory boot mode	61](#_bookmark42)
[Table 11.	STM32C011xx bootloader versions	62](#_bookmark46)
[Table 12.	STM32C031xx configuration in system memory boot mode	63](#_bookmark49)
[Table 13.	STM32C031xx bootloader versions	64](#_bookmark53)
[Table 14.	STM32C051xx configuration in system memory boot mode	65](#_bookmark56)
[Table 15.	STM32C051xx bootloader versions	69](#_bookmark62)
[Table 16.	STM32C071xx configuration in system memory boot mode	70](#_bookmark65)
[Table 17.	STM32C071xx bootloader versions	73](#_bookmark71)
[Table 18.	STM32C091xx/92xx configuration in system memory boot mode	74](#_bookmark74)
[Table 19.	STM32C091xx/92xx bootloader versions	78](#_bookmark80)
[Table 20.	STM32C531xx/532xx/542xx configuration in system memory boot mode	79](#_bookmark83)
[Table 21.	STM32C531xx/532xx/542xx special commands	82](#_bookmark85)
[Table 22.	STM32C531xx/532xx/542xx bootloader versions	83](#_bookmark89)
[Table 23.	STM32C55xxx/562xx configuration in system memory boot mode	84](#_bookmark92)
[Table 24.	STM32C55xxx/562xx special commands	86](#_bookmark93)
[Table 25.	STM32C55xxx/562xx bootloader versions	87](#_bookmark97)
[Table 26.	STM32C5A3xx/59xxx configuration in system memory boot mode	88](#_bookmark100)
[Table 27.	STM32C5A3xx/59xxx special commands	90](#_bookmark101)
[Table 28.	STM32C55xxx/562xx bootloader versions	91](#_bookmark105)
[Table 29.	STM32F03xx4/6 configuration in system memory boot mode	92](#_bookmark108)
[Table 30.	STM32F03xx4/6 bootloader versions	93](#_bookmark112)
[Table 31.	STM32F030xC configuration in system memory boot mode	94](#_bookmark115)
[Table 32.	STM32F030xC bootloader versions	95](#_bookmark119)
[Table 33.	STM32F05xxx and STM32F030x8 devices configuration in system memory boot mode . 96](#_bookmark122) [Table 34.	STM32F05xxx and STM32F030x8 devices bootloader versions	97](#_bookmark126)
[Table 35.	STM32F04xxx configuration in system memory boot mode	98](#_bookmark129)
[Table 36.	STM32F04xxx bootloader versions	101](#_bookmark133)
[Table 37.	STM32F070x6 configuration in system memory boot mode.	102](#_bookmark136)
[Table 38.	STM32F070x6 bootloader versions	105](#_bookmark140)
[Table 39.	STM32F070xB configuration in system memory boot mode	106](#_bookmark143)
[Table 40.	STM32F070xB bootloader versions	109](#_bookmark147)
[Table 41.	STM32F071xx/072xx configuration in system memory boot mode	110](#_bookmark150)
[Table 42.	STM32F071xx/072xx bootloader versions	113](#_bookmark154)
[Table 43.	STM32F09xxx configuration in system memory boot mode	114](#_bookmark157)
[Table 44.	STM32F09xxx bootloader versions	115](#_bookmark161)
[Table 45.	STM32F10xxx configuration in system memory boot mode	116](#_bookmark164)
[Table 46.	STM32F10xxx bootloader versions	117](#_bookmark168)
[Table 47.	STM32F105xx/107xx configuration in system memory boot mode	119](#_bookmark171)
[Table 48.	STM32F105xx/107xx bootloader versions	122](#_bookmark175)

[Table 49.	STM32F10xxx XL-density configuration in system memory boot mode	125](#_bookmark183)
[Table 50.	STM32F10xxx XL-density bootloader versions	126](#_bookmark187)
[Table 51.	STM32F2xxxx configuration in system memory boot mode	127](#_bookmark191)
[Table 52.	STM32F2xxxx bootloader V2.x versions	129](#_bookmark195)
[Table 53.	STM32F2xxxx configuration in system memory boot mode	130](#_bookmark198)
[Table 54.	STM32F2xxxx bootloader V3.x versions	133](#_bookmark202)
[Table 55.	STM32F301xx/302x4(6/8) configuration in system memory boot mode.	134](#_bookmark205)
[Table 56.	STM32F301xx/302x4(6/8) bootloader versions	137](#_bookmark209)
[Table 57.	STM32F302xB(C)/303xB(C) configuration in system memory boot mode	138](#_bookmark212)
[Table 58.	STM32F302xB(C)/303xB(C) bootloader versions	140](#_bookmark216)
[Table 59.	STM32F302xD(E)/303xD(E) configuration in system memory boot mode	141](#_bookmark219)
[Table 60.	STM32F302xD(E)/303xD(E) bootloader versions	144](#_bookmark223)
[Table 61.	STM32F303x4(6/8)/334xx/328xx configuration in system memory boot mode	145](#_bookmark226)
[Table 62.	STM32F303x4(6/8)/334xx/328xx bootloader versions	146](#_bookmark230)
[Table 63.	STM32F318xx configuration in system memory boot mode	147](#_bookmark233)
[Table 64.	STM32F318xx bootloader versions	149](#_bookmark237)
[Table 65.	STM32F358xx configuration in system memory boot mode	150](#_bookmark240)
[Table 66.	STM32F358xx bootloader versions	151](#_bookmark244)
[Table 67.	STM32F373xx configuration in system memory boot mode	152](#_bookmark247)
[Table 68.	STM32F373xx bootloader versions	155](#_bookmark251)
[Table 69.	STM32F378xx configuration in system memory boot mode	156](#_bookmark254)
[Table 70.	STM32F378xx bootloader versions	157](#_bookmark258)
[Table 71.	STM32F398xx configuration in system memory boot mode	158](#_bookmark261)
[Table 72.	STM32F398xx bootloader versions	160](#_bookmark265)
[Table 73.	STM32F40xxx/41xxx configuration in system memory boot mode	161](#_bookmark269)
[Table 74.	STM32F40xxx/41xxx bootloader V3.x versions	164](#_bookmark273)
[Table 75.	STM32F40xxx/41xxx configuration in system memory boot mode	165](#_bookmark276)
[Table 76.	STM32F40xxx/41xxx bootloader V9.x versions	169](#_bookmark281)
[Table 77.	STM32F401xB(C) configuration in system memory boot mode	170](#_bookmark284)
[Table 78.	STM32F401xB(C) bootloader versions	174](#_bookmark288)
[Table 79.	STM32F401xD(E) configuration in system memory boot mode	175](#_bookmark291)
[Table 80.	STM32F401xD(E) bootloader versions	179](#_bookmark295)
[Table 81.	STM32F410xx configuration in system memory boot mode	180](#_bookmark298)
[Table 82.	STM32F410xx bootloader V11.x versions	184](#_bookmark302)
[Table 83.	STM32F411xx configuration in system memory boot mode	185](#_bookmark305)
[Table 84.	STM32F411xx bootloader versions	189](#_bookmark309)
[Table 85.	STM32F412xx configuration in system memory boot mode	190](#_bookmark312)
[Table 86.	STM32F412xx bootloader V9.x versions	195](#_bookmark316)
[Table 87.	STM32F413xx/423xx configuration in system memory boot mode	196](#_bookmark319)
[Table 88.	STM32F413xx/423xx bootloader V9.x versions	201](#_bookmark323)
[Table 89.	STM32F42xxx/43xxx configuration in system memory boot mode	202](#_bookmark327)
[Table 90.	STM32F42xxx/43xxx bootloader V7.x versions	207](#_bookmark332)
[Table 91.	STM32F42xxx/43xxx configuration in system memory boot mode	208](#_bookmark335)
[Table 92.	STM32F42xxx/43xxx bootloader V9.x versions	214](#_bookmark340)
[Table 93.	STM32F446xx configuration in system memory boot mode	215](#_bookmark343)
[Table 94.	STM32F446xx bootloader V9.x versions	220](#_bookmark347)
[Table 95.	STM32F469xx/479xx configuration in system memory boot mode	221](#_bookmark350)
[Table 96.	STM32F469xx/479xx bootloader V9.x versions	227](#_bookmark355)
[Table 97.	STM32F72xxx/73xxx configuration in system memory boot mode	228](#_bookmark358)
[Table 98.	STM32F72xxx/73xxx bootloader V9.x versions	233](#_bookmark362)
[Table 99.	STM32F74xxx/75xxx configuration in system memory boot mode	234](#_bookmark366)
[Table 100.  STM32F74xxx/75xxx bootloader V7.x versions	237](#_bookmark370)

[Table 101.  STM32F74xxx/75xxx configuration in system memory boot mode	238](#_bookmark373)
[Table 102.  STM32F74xxx/75xxx bootloader V9.x versions	243](#_bookmark377)
[Table 103.  STM32F76xxx/77xxx configuration in system memory boot mode	244](#_bookmark380)
[Table 104.  STM32F76xxx/77xxx bootloader V9.x versions	250](#_bookmark385)
[Table 105.  STM32G03xxx/G04xxx configuration in system memory boot mode	251](#_bookmark388)
[Table 106.  STM32G03xxx/04xxx bootloader versions	253](#_bookmark392)
[Table 107.  STM32G07xxx/8xxx configuration in system memory boot mode	254](#_bookmark395)
[Table 108.  STM32G07xxx/08xxx bootloader versions	257](#_bookmark400)
[Table 109.  STM32G0B0xx configuration in system memory boot mode	260](#_bookmark404)
[Table 110.  STM32G0B0xx bootloader versions	264](#_bookmark409)
[Table 111.  STM32G0B1xx/0C1xx configuration in system memory boot mode	265](#_bookmark412)
[Table 112.  STM32G0B1xx/0C1xx bootloader versions	269](#_bookmark417)
[Table 113.  STM32G05xxx/061xx configuration in system memory boot mode	270](#_bookmark420)
[Table 114.  STM32G05xxx/061xx bootloader versions	273](#_bookmark424)
[Table 115.  STM32G431xx/441xx configuration in system memory boot mode	274](#_bookmark427)
[Table 116.  STM32G431xx/441xx bootloader version	278](#_bookmark432)
[Table 117.  STM32G47xxx/48xxx configuration in system memory boot mode	279](#_bookmark435)
[Table 118.  STM32G47xxx/48xxx bootloader version	283](#_bookmark441)
[Table 119.  STM32G491xx/4A1xx configuration in system memory boot mode	285](#_bookmark444)
[Table 120.  STM32G491xx/4A1xx bootloader version	289](#_bookmark449)
[Table 121.  STM32H503xx configuration in system memory boot mode	290](#_bookmark452)
[Table 122.  STM32H503xx special commands	293](#_bookmark453)
[Table 123.  STM32H503xx bootloader version	295](#_bookmark457)
[Table 124.  STM32H523xx/533xx configuration in system memory boot mode	296](#_bookmark460)
[Table 125.  STM32H523xx/533xx special commands	300](#_bookmark461)
[Table 126.  STM32H523xx/533xx bootloader version	302](#_bookmark465)
[Table 127.  STM32H562xx/563xx/573xx configuration in system memory boot mode	303](#_bookmark468)
[Table 128.  STM32H562xx/563xx/573xx special commands	306](#_bookmark469)
[Table 129. STM32H562xx/563xx/573xx bootloader version	308](#_bookmark473)
[Table 130.  STM32H5Ex/5Fx configuration in system memory boot mode	309](#_bookmark476)
[Table 131.  STM32H5Ex/5Fx special commands	312](#_bookmark477)
[Table 132.  STM32H5Ex/5Fx bootloader versions	313](#_bookmark481)
[Table 133.  STM32H72xxx/73xxx configuration in system memory boot mode	314](#_bookmark484)
[Table 134.  STM32H72xxx/73xxx bootloader version	319](#_bookmark488)
[Table 135.  STM32H74xxx/75xxx configuration in system memory boot mode	320](#_bookmark491)
[Table 136.  STM32H74xxx/75xxx bootloader version	325](#_bookmark496)
[Table 137.  STM32H7A3xx/7B3xx/7B0xx configuration in system memory boot mode	328](#_bookmark499)
[Table 138.  STM32H7A3xx/7B3xx/7B0xx bootloader version	334](#_bookmark503)
[Table 139.  STM32H7Rxxx/7Sxxx configuration in system memory boot mode	335](#_bookmark506)
[Table 140.  STM32H7Rxxx/7Sxxx special commands	339](#_bookmark508)
[Table 141.  STM32H7Rxxx/7Sxxx bootloader version	341](#_bookmark512)
[Table 142.  STM32L01xxx/02xxx configuration in system memory boot mode	342](#_bookmark516)
[Table 143.  STM32L01xxx/02xxx bootloader versions	345](#_bookmark521)
[Table 144.  STM32L031xx/041xx configuration in system memory boot mode	346](#_bookmark524)
[Table 145.  STM32L031xx/041xx bootloader versions	348](#_bookmark528)
[Table 146.  STM32L05xxx/06xxx configuration in system memory boot mode	349](#_bookmark531)
[Table 147.  STM32L05xxx/06xxx bootloader versions	351](#_bookmark535)
[Table 148.  STM32L07xxx/08xxx configuration in system memory boot mode	352](#_bookmark539)
[Table 149.  STM32L07xxx/08xxx bootloader versions	356](#_bookmark544)
[Table 150.  STM32L07xxx/08xxx configuration in system memory boot mode	357](#_bookmark547)
[Table 151.  STM32L07xxx/08xxx bootloader V11.x versions	360](#_bookmark552)
[Table 152.  STM32L1xxx6(8/B)A configuration in system memory boot mode	361](#_bookmark555)

[Table 153.  STM32L1xxx6(8/B)A bootloader versions	362](#_bookmark559)
[Table 154.  STM32L1xxx6(8/B) configuration in system memory boot mode	363](#_bookmark562)
[Table 155.  STM32L1xxx6(8/B) bootloader versions	364](#_bookmark566)
[Table 156.  STM32L1xxxC configuration in system memory boot mode	365](#_bookmark569)
[Table 157.  STM32L1xxxC bootloader versions	368](#_bookmark573)
[Table 158.  STM32L1xxxD configuration in system memory boot mode	369](#_bookmark576)
[Table 159.  STM32L1xxxD bootloader versions	372](#_bookmark580)
[Table 160.  STM32L1xxxE configuration in system memory boot mode	373](#_bookmark583)
[Table 161.  STM32L1xxxE bootloader versions	376](#_bookmark587)
[Table 162.  STM32L412xx/422xx configuration in system memory boot mode	377](#_bookmark590)
[Table 163.  STM32L412xx/422xx bootloader versions	382](#_bookmark597)
[Table 164.  STM32L43xxx/44xxx configuration in system memory boot mode	383](#_bookmark600)
[Table 165.  STM32L43xxx/44xxx bootloader versions	389](#_bookmark606)
[Table 166.  STM32L45xxx/46xxx configuration in system memory boot mode	391](#_bookmark609)
[Table 167.  STM32L45xxx/46xxx bootloader versions	397](#_bookmark615)
[Table 168.  STM32L47xxx/48xxx configuration in system memory boot mode	398](#_bookmark619)
[Table 169.  STM32L47xxx/48xxx bootloader V10.x versions	403](#_bookmark624)
[Table 170.  STM32L47xxx/48xxx configuration in system memory boot mode	404](#_bookmark627)
[Table 171.  STM32L47xxx/48xxx bootloader V9.x versions	409](#_bookmark634)
[Table 172.  STM32L496xx/4A6xx configuration in system memory boot mode	410](#_bookmark637)
[Table 173.  STM32L496xx/4A6xx bootloader version	416](#_bookmark643)
[Table 174.  STM32L4P5xx/4Q5xx configuration in system memory boot mode	417](#_bookmark646)
[Table 175.  STM32L4P5xx/4Q5xx bootloader versions	423](#_bookmark651)
[Table 176.  STM32L4Rxxx/4Sxxx configuration in system memory boot mode	424](#_bookmark654)
[Table 177.  STM32L4Rxx/4Sxx bootloader versions	430](#_bookmark659)
[Table 178.  STM32L552xx/62xx configuration in system memory boot mode	431](#_bookmark662)
[Table 179.  STM32L552xx/62xx special commands	434](#_bookmark663)
[Table 180.  STM32L552xx/62xx bootloader versions	436](#_bookmark667)
[Table 181.  STM32WB10xx/15xx configuration in system memory boot mode	437](#_bookmark670)
[Table 182.  STM32WB10xx/15xx bootloader versions	440](#_bookmark674)
[Table 183.  STM32WB30xx/35xx/50xx/55xx configuration in system memory boot mode	441](#_bookmark677)
[Table 184. STM32WB30xx/35xx/50xx/55xx bootloader versions	445](#_bookmark681)
[Table 185.  STM32WBA5xxx configuration in system memory boot mode	446](#_bookmark684)
[Table 186.  STM32WBA5xxx special commands	447](#_bookmark685)
[Table 187.  STM32WBA5xxx bootloader versions	449](#_bookmark689)
[Table 188.  STM32WBA2xxx configuration in system memory boot mode	450](#_bookmark692)
[Table 189.  STM32WBA2xxx special commands	453](#_bookmark693)
[Table 190.  STM32WBA2xxx bootloader versions	455](#_bookmark697)
[Table 191.  STM32WBA62xx/63xx/64xx/65xx configuration in system memory boot mode	456](#_bookmark700)
[Table 192.  STM32WBA62xx/63xx/64xx/65xx special commands	458](#_bookmark701)
[Table 193. STM32WBA62xx/63xx/64xx/65xx bootloader versions	459](#_bookmark705)
[Table 194.  STM32WB05xx configuration in system memory boot mode	460](#_bookmark708)
[Table 195.  STM32WB05xx bootloader versions	461](#_bookmark712)
[Table 196.  STM32WB06xx/07xx configuration in system memory boot mode	462](#_bookmark715)
[Table 197.  STM32WB06xx/07xx bootloader versions	463](#_bookmark719)
[Table 198.  STM32WB09xx configuration in system memory boot mode	464](#_bookmark722)
[Table 199.  STM32WB09xx bootloader versions	465](#_bookmark726)
[Table 200.  STM32WL3xxx configuration in system memory boot mode	466](#_bookmark729)
[Table 201.  STM32WL3xxx bootloader versions	467](#_bookmark733)
[Table 202.  STM32WLE5xx/55xx configuration in system memory boot mode	468](#_bookmark736)
[Table 203.  STM32WLE5xx/55xx bootloader versions	470](#_bookmark740)
[Table 204.  STM32U031xx configuration in system memory boot mode	471](#_bookmark743)

[Table 205.  STM32U031xx bootloader versions	475](#_bookmark748)
[Table 206.  STM32U073xx/83xx configuration in system memory boot mode	476](#_bookmark751)
[Table 207.  STM32U073xx/83xx bootloader versions	480](#_bookmark756)
[Table 208.  STM32U375xx/85xx configuration in system memory boot mode	481](#_bookmark759)
[Table 209.  STM32U375xx/385xx special commands	485](#_bookmark763)
[Table 210.  STM32U375xx/85xx bootloader versions	487](#_bookmark767)
[Table 211.  STM32U3B5xx/3C5xx configuration in system memory boot mode	488](#_bookmark770)
[Table 212.  STM32U3B5xx/3C5xx special commands	492](#_bookmark772)
[Table 213.  STM32U3B5xx/3C5xx bootloader versions	494](#_bookmark776)
[Table 214.  STM32U535xx/545xx configuration in system memory boot mode	495](#_bookmark779)
[Table 215.  STM32U535xx/545xx special commands	498](#_bookmark780)
[Table 216.  STM32U535xx/545xx bootloader versions	500](#_bookmark784)
[Table 217.  STM32U575xx/85xx configuration in system memory boot mode	501](#_bookmark787)
[Table 218.  STM32U575xx/585xx special commands	504](#_bookmark788)
[Table 219.  STM32U575xx/85xx bootloader versions	506](#_bookmark792)
[Table 220.  STM32U595xx/99xx/A5xx/A9xx configuration in system memory boot mode	507](#_bookmark795)
[Table 221. STM32U595xx/99xx/A5xx/A9xx special commands	510](#_bookmark796)
[Table 222. STM32U595xx/99xx/A5xx/A9xx bootloader versions	511](#_bookmark800)
[Table 223.  STM32U5F7xx/F9xx/G7xx/G9xx configuration in system memory boot mode	512](#_bookmark803)
[Table 224.  STM32U5F7xx/F9xx/G7xx/G9xx special commands	515](#_bookmark804)
[Table 225.  STM32U5F7xx/F9xx/G7xx/G9xx bootloader versions	516](#_bookmark808)
[Table 226.  Bootloader device-dependent parameters	517](#_bookmark810)
[Table 227.  Bootloader startup timings (ms)	524](#_bookmark814)
[Table 228.  USART bootloader minimum timings (ms)	528](#_bookmark817)
[Table 229.  USB bootloader minimum timings (ms)	532](#_bookmark820)
[Table 230.  I2C bootloader minimum timings (ms)	534](#_bookmark823)
[Table 231.  SPI bootloader minimum timings (ms) for STM32 devices	537](#_bookmark826)
[Table 232.  Document revision history	543](#_bookmark830)

**List** **of** **figures**

[Figure 1.	USART connection	47](#_bookmark13)
[Figure 2.	USB connection	48](#_bookmark14)
[Figure 3.	I2C connection	48](#_bookmark15)
[Figure 4.	SPI connection	49](#_bookmark16)
[Figure 5.	CAN connection	49](#_bookmark17)
[Figure 6.	ExitSecureMemory function usage	55](#_bookmark27)
[Figure 7.	Access to securable memory area from the bootloader	56](#_bookmark28)
[Figure 8.	Defining an MPU region	56](#_bookmark30)
[Figure 9.	BL_V1 (left) and BL_V2 (right) models	58](#_bookmark34)
[Figure 10.	Boot_V1 (left) and Boot_V2 (right)	59](#_bookmark37)
[Figure 11.	Boot_V3_1	60](#_bookmark38)
[Figure 12.	Boot_V3_2	60](#_bookmark39)
[Figure 13.	Bootloader V5.x selection for STM32C011xx devices	62](#_bookmark44)
[Figure 14.	Bootloader V5.x selection for STM32C031xx devices	64](#_bookmark51)
[Figure 15.	Bootloader V11.0 selection for STM32C051xx devices	68](#_bookmark60)
[Figure 16.	Bootloader V13.1 selection for STM32C071xx devices	72](#_bookmark69)
[Figure 17.	Bootloader V18.1 selection for STM32C091xx/92xx devices	77](#_bookmark78)
[Figure 18.	Bootloader V16.x selection for STM32C531xx/532xx/542xx devices	83](#_bookmark87)
[Figure 19.	Bootloader V16.x selection for STM32C55xxx/562xx devices	87](#_bookmark95)
[Figure 20.	Bootloader V16.x selection for STM32C55xxx/562xx devices	91](#_bookmark103)
[Figure 21.	Bootloader selection for STM32F03xx4/6 devices	93](#_bookmark110)
[Figure 22.	Bootloader selection for STM32F030xC	95](#_bookmark117)
[Figure 23.	Bootloader selection for STM32F05xxx and STM32F030x8 devices	97](#_bookmark124)
[Figure 24.	Bootloader selection for STM32F04xxx	100](#_bookmark131)
[Figure 25.	Bootloader selection for STM32F070x6	104](#_bookmark138)
[Figure 26.	Bootloader selection for STM32F070xB	108](#_bookmark145)
[Figure 27.	Bootloader selection for STM32F071xx/072xx	112](#_bookmark152)
[Figure 28.	Bootloader selection for STM32F09xxx	115](#_bookmark159)
[Figure 29.	Bootloader selection for STM32F10xxx	117](#_bookmark166)
[Figure 30.	Bootloader selection for STM32F105xx/107xx devices	121](#_bookmark173)
[Figure 31.	Bootloader selection for STM32F10xxx XL-density devices	126](#_bookmark185)
[Figure 32.	Bootloader V2.x selection for STM32F2xxxx devices	128](#_bookmark193)
[Figure 33.	Bootloader V3.x selection for STM32F2xxxx devices	132](#_bookmark200)
[Figure 34.	Bootloader selection for STM32F301xx/302x4(6/8)	136](#_bookmark207)
[Figure 35.	Bootloader selection for STM32F302xB(C)/303xB(C) devices	140](#_bookmark214)
[Figure 36.	Bootloader selection for STM32F302xD(E)/303xD(E)	143](#_bookmark221)
[Figure 37.	Bootloader selection for STM32F303x4(6/8)/334xx/328xx	146](#_bookmark228)
[Figure 38.	Bootloader selection for STM32F318xx	148](#_bookmark235)
[Figure 39.	Bootloader selection for STM32F358xx devices	151](#_bookmark242)
[Figure 40.	Bootloader selection for STM32F373xx devices	154](#_bookmark249)
[Figure 41.	Bootloader selection for STM32F378xx devices	157](#_bookmark256)
[Figure 42.	Bootloader selection for STM32F398xx	159](#_bookmark263)
[Figure 43.	Bootloader V3.x selection for STM32F40xxx/41xxx devices	163](#_bookmark271)
[Figure 44.	Bootloader V9.x selection for STM32F40xxx/41xxx	168](#_bookmark279)
[Figure 45.	Bootloader selection for STM32F401xB(C)	173](#_bookmark286)
[Figure 46.	Bootloader selection for STM32F401xD(E)	178](#_bookmark293)
[Figure 47.	Bootloader V11.x selection for STM32F410xx	183](#_bookmark300)
[Figure 48.	Bootloader selection for STM32F411xx	188](#_bookmark307)

[Figure 49.	Bootloader V9.x selection for STM32F412xx	194](#_bookmark314)
[Figure 50.	Bootloader V9.x selection for STM32F413xx/423xx	200](#_bookmark321)
[Figure 51.	Dual bank boot implementation for STM32F42xxx/43xxx Bootloader V7.x	205](#_bookmark329)
[Figure 52.	Bootloader V7.x selection for STM32F42xxx/43xxx	206](#_bookmark330)
[Figure 53.	Dual bank boot implementation for STM32F42xxx/43xxx bootloader V9.x	212](#_bookmark337)
[Figure 54.	Bootloader V9.x selection for STM32F42xxx/43xxx	213](#_bookmark338)
[Figure 55.	Bootloader V9.x selection for STM32F446xx	219](#_bookmark345)
[Figure 56.	Dual bank boot implementation for STM32F469xx/479xx Bootloader V9.x	225](#_bookmark352)
[Figure 57.	Bootloader V9.x selection for STM32F469xx/479xx	226](#_bookmark353)
[Figure 58.	Bootloader V9.x selection for STM32F72xxx/73xxx	232](#_bookmark360)
[Figure 59.	Bootloader V7.x selection for STM32F74xxx/75xxx	237](#_bookmark368)
[Figure 60.	Bootloader V9.x selection for STM32F74xxx/75xxx	242](#_bookmark375)
[Figure 61.	Dual bank boot implementation for STM32F76xxx/77xxx Bootloader V9.x	248](#_bookmark382)
[Figure 62.	Bootloader V9.x selection for STM32F76xxx/77xxx	249](#_bookmark383)
[Figure 63.	Bootloader V5.x selection for STM32G03xxx/G04xxx	252](#_bookmark390)
[Figure 64.	Bootloader V11.0 selection for STM32G07xxx/G08xxx	257](#_bookmark398)
[Figure 65.	Bootloader selection for STM32G0B0xx	263](#_bookmark407)
[Figure 66.	Bootloader selection for STM32G0B1xx/0C1xx	268](#_bookmark415)
[Figure 67.	Bootloader selection for STM32G05xxx/061xx	272](#_bookmark422)
[Figure 68.	Bootloader selection for STM32G431xx/441xx	277](#_bookmark430)
[Figure 69.	Bootloader selection for STM32G47xxx/48xxx	282](#_bookmark438)
[Figure 70.	Dual bank boot implementation for STM32G47xxx/48xxx bootloader V13.x	283](#_bookmark439)
[Figure 71.	Bootloader selection for STM32G491xx/4A1xx	288](#_bookmark447)
[Figure 72.	Bootloader V14 selection for STM32H503xx	294](#_bookmark455)
[Figure 73.	Bootloader V14 selection for STM32H523xx/533xx	301](#_bookmark463)
[Figure 74.	Bootloader V14 selection for STM32H562xx/563xx/573xx	307](#_bookmark471)
[Figure 75.	Bootloader V15.x selection for STM32H5Ex/5Fx devices	313](#_bookmark479)
[Figure 76.	Bootloader V9.0 selection for STM32H72xxx/73xxx	318](#_bookmark486)
[Figure 77.	Bootloader V9.x selection for STM32H74xxx/75xxx	324](#_bookmark494)
[Figure 78.	Bootloader V9.x selection for STM32H7A3xx/7B3xx/7B0xx	333](#_bookmark501)
[Figure 79.	Bootloader V14.x selection for STM32H7Rxxx/7Sxxx	340](#_bookmark510)
[Figure 80.	Bootloader selection for STM32L01xxx/02xxx	344](#_bookmark519)
[Figure 81.	Bootloader selection for STM32L031xx/041xx	348](#_bookmark526)
[Figure 82.	Bootloader selection for STM32L05xxx/06xxx	351](#_bookmark533)
[Figure 83.	Dual bank boot implementation for STM32L07xxx/08xxx bootloader V4.x.	354](#_bookmark541)
[Figure 84.	Bootloader V4.x selection for STM32L07xxx/08xxx	355](#_bookmark542)
[Figure 85.	Dual bank boot implementation for STM32L07xxx/08xxx bootloader V11.x.	359](#_bookmark549)
[Figure 86.	Bootloader V11.x selection for STM32L07xxx/08xxx	360](#_bookmark550)
[Figure 87.	Bootloader selection for STM32L1xxx6(8/B)A devices	362](#_bookmark557)
[Figure 88.	Bootloader selection for STM32L1xxx6(8/B) devices	364](#_bookmark564)
[Figure 89.	Bootloader selection for STM32L1xxxC devices	367](#_bookmark571)
[Figure 90.	Bootloader selection for STM32L1xxxD devices	371](#_bookmark578)
[Figure 91.	Bootloader selection for STM32L1xxxE devices	375](#_bookmark585)
[Figure 92.	Dual bank boot Implementation for STM32L412xx/422xx bootloader V9.x	380](#_bookmark594)
[Figure 93.	Bootloader V13.x selection for STM32L412xx/422xx	381](#_bookmark595)
[Figure 94.	Dual bank boot Implementation for STM32L3x2xx/44xxx bootloader V9.x	387](#_bookmark603)
[Figure 95.	Bootloader V9.x selection for STM32L43xxx/44xxx	388](#_bookmark604)
[Figure 96.	Dual bank boot implementation for STM32L45xxx/46xxx bootloader V9.x.	395](#_bookmark612)
[Figure 97.	Bootloader V9.x selection for STM32L45xxx/46xxx	396](#_bookmark613)
[Figure 98.	Dual bank boot implementation for STM32L47xxx/48xxx bootloader V10.x.	401](#_bookmark621)
[Figure 99.	Bootloader V10.x selection for STM32L47xxx/48xxx	402](#_bookmark622)
[Figure 100. Dual bank boot implementation for STM32L47xxx/48xxx bootloader V9.x.	407](#_bookmark631)

[Figure 101. Bootloader V9.x selection for STM32L47xxx/48xxx	408](#_bookmark632)
[Figure 102. Dual bank boot Implementation for STM32L496xx/4A6xx bootloader V9.x	414](#_bookmark640)
[Figure 103. Bootloader V9.x selection for STM32L496xx/4A6xx	415](#_bookmark641)
[Figure 104. Dual bank boot implementation for STM32L4P5xx/4Q5xx bootloader V9.x	421](#_bookmark648)
[Figure 105. Bootloader V9.x selection for STM32L4P5xx/4Q5xx	422](#_bookmark649)
[Figure 106. Dual bank boot implementation for STM32L4Rxxx/STM32L4Sxxx bootloader V9.x	428](#_bookmark656)
[Figure 107. Bootloader V9.x selection for STM32L4Rxx/4Sxx	429](#_bookmark657)
[Figure 108. Bootloader V9.x selection for STM32L552xx/62xx	435](#_bookmark665)
[Figure 109. Bootloader V11.x selection for STM32WB10xx/15xx	439](#_bookmark672)
[Figure 110. Bootloader V13.0 selection for STM32WB30xx/35xx/50xx/55xx	444](#_bookmark679)
[Figure 111. Bootloader V11.x selection for STM32WBA5xxx	448](#_bookmark687)
[Figure 112. Bootloader V13.x selection for STM32WBA2xxx	454](#_bookmark695)
[Figure 113. Bootloader V13.2 selection for STM32WBA62xx/63xx/64xx/65xx	459](#_bookmark703)
[Figure 114. Bootloader V2.x selection for STM32WB05xx	461](#_bookmark710)
[Figure 115. Bootloader V4.x selection for STM32WB06xx/07xx	463](#_bookmark717)
[Figure 116. Bootloader V1.x selection for STM32WB09xx	465](#_bookmark724)
[Figure 117. Bootloader V12.x selection for STM32WL3xxx	467](#_bookmark731)
[Figure 118. Bootloader V12.x selection for STM32WLE5xx/55xx	470](#_bookmark738)
[Figure 119. Bootloader V11.x selection for STM32U031xx	474](#_bookmark746)
[Figure 120. Bootloader V13.x selection for STM32U073xx/83xx	479](#_bookmark754)
[Figure 121. Bootloader V14.2 selection for STM32U375xx/85xx	486](#_bookmark765)
[Figure 122. Bootloader V14.0 selection for STM32U3B5xx/3C5xx	493](#_bookmark774)
[Figure 123. Bootloader V9.x selection for STM32U535xx/545xx	499](#_bookmark782)
[Figure 124. Bootloader V9.x selection for STM32U575xx/85xx	505](#_bookmark790)
[Figure 125. Bootloader V9.x selection for STM32U595xx/99xx/A5xx/A9xx	511](#_bookmark798)
[Figure 126. Bootloader V9.x selection for STM32U5F7xx/F9xx/G7xx/G9xx	516](#_bookmark806)
[Figure 127. Bootloader startup timing description	524](#_bookmark813)
[Figure 128. USART connection timing description	528](#_bookmark816)
[Figure 129. USB connection timing description	531](#_bookmark819)
[Figure 130. I2C connection timing description	534](#_bookmark822)
[Figure 131. SPI connection timing description	537](#_bookmark825)

## General information


This document applies to Arm®(a)-based devices.



## Related documents


For each supported product refer to the following documents, available on [www.st.com:](http://www.st.com/)
- Datasheet or databrief
- Reference manual
- Application notes
  - AN3154: How to use CAN protocol in bootloader on STM32 MCUs
  - AN3155: How to use USART protocol in bootloader on STM32 MCUs
  - AN3156: How to use USB DFU protocol in bootloader on STM32 MCUs
  - AN4221: How to use I2C protocol in bootloader on STM32 MCUs
  - AN4286: How to use SPI protocol in bootloader on STM32 MCUs
  - AN5405: How to use FDCAN protocol in bootloader on STM32 MCUs
  - AN5927: How to use I3C protocol in bootloader on STM32 MCUs























a. Arm is a registered trademark of Arm Limited (or its subsidiaries or affiliates) in the US and/or elsewhere. The Arm word and logo are trademarks of Arm Limited (or its subsidiaries) in the US and/or elsewhere. All rights reserved

## Glossary


**C0** **series:**
**STM32C011xx** **indicates STM32C011xx devices **STM32C031xx** **indicates STM32C031xx devices **STM32C051xx** **indicates STM32C051xx devices **STM32C071xx** **indicates STM32C071xx devices
**STM32C091xx/92xx** **indicates STM32C091xx and STM32C092xx devices
**C5** **series:**
**STM32C5A3xx** **indicates STM32C5A3xx devices.
**STM32C591xx/593xx** **indicates STM32C591xx and STM32C593xx devices.
**STM32C55xxx** **indicates STM32C551xx and STM32C552xx devices.
**STM32C562xx** **indicates STM32C562xx devices.
**STM32C531xx/532xx** **indicates STM32C531xx and STM32C532xx devices.
**STM32C542xx** **indicates STM32C542xx devices.
**F0** **series:**
**STM32F03xxx** **indicates STM32F030x4, STM32F030x6, STM32F038x6, STM32F030xC, STM32F031x4, and STM32F031x6 devices
**STM32F04xxx** **indicates STM32F042x4 and STM32F042x6 devices
**STM32F05xxx** **and** **STM32F030x8** **devices** **indicates STM32F051x4, STM32F051x6, STM32F051x8, STM32F058x8, and STM32F030x8 devices
STM32F07xxx indicates STM32F070x6, STM32F070xB, STM32F071xB,
STM32F072x8, and STM32F072xB devices
**STM32F09xxx** **indicates STM32F091xx and STM32F098xx devices


**F1** **series:**
**STM32F10xxx** **indicates Low-density, Medium-density, High-density, Low-density value line, Medium-density value line, and High-density value line devices:
**Low-density** **devices** **are STM32F101xx, STM32F102xx, and STM32F103xx microcontrollers, where the flash memory density ranges between 16 and
32 Kbytes.
**Medium-density** **devices** **are STM32F101xx, STM32F102xx, and STM32F103xx microcontrollers, where the flash memory density ranges between 64 and
128 Kbytes.
**High-density** **devices** **are STM32F101xx and STM32F103xx microcontrollers, where the flash memory density ranges between 256 and 512 Kbytes.
**Low-density** **value** **line** **devices** **are STM32F100xx microcontrollers, where the flash memory density ranges between 16 and 32 Kbytes.
**Medium-density** **value** **line** **devices** **are STM32F100xx microcontrollers, where the flash memory density ranges between 64 and 128 Kbytes.
**High-density** **value** **line** **devices** **are STM32F100xx microcontrollers, where the flash memory density ranges between 256 and 512 Kbytes.
**STM32F105xx/107xx** **indicates STM32F105xx and STM32F107xx devices
**STM32F10xxx** **XL-density** **indicates STM32F101xx and STM32F103xx devices, where the flash memory density ranges between 768 Kbytes and 1 Mbyte.
**F2** **series:**
**STM32F2xxxx** **indicates STM32F215xx, STM32F205xx, STM32F207xx, and SMT32F217xx devices
**F3** **series:**
**STM32F301xx/302x4(6/8)** **indicates STM32F301x4, STM32F301x6, STM32F301x8, STM32F302x4, STM32F302x6, and STM32F302x8 devices
**STM32F302xB(C)/303xB(C)** **indicates STM32F302xB, STM32F302xC,
STM32F303xB and STM32F303xC devices
**STM32F302xD(E)/303xD(E)** **indicates STM32F302xD, STM32F302xE,
STM32F303xD, and STM32F303xE devices
**STM32F303x4(6/8)/334xx/328xx **indicates STM32F303x4, STM32F303x6, STM32F303x8, STM32F334x4, STM32F334x6, STM32F334x8, and STM32F328x8
devices
**STM32F318xx** **indicates STM32F318x8 devices
**STM32F358xx** **indicates STM32F358xC devices
**STM32F373xx** **indicates STM32F373x8, STM32F373xB and STM32F373xC devices
**STM32F378xx** **indicates STM32F378xC devices
**STM32F398xx** **indicates STM32F398xE devices


**F4** **series:**
**STM32F40xxx/41xxx** **indicates STM32F405xx, STM32F407xx, STM32F415xx, and SMT32F417xx devices
**STM32F401xB(C) **indicates STM32F401xB and STM32F401xC devices **STM32F401xD(E) **indicates STM32F401xD and STM32F401xE devices **STM32F410xx **indicates STM32F410x8 and STM32F410xB devices **STM32F411xx **indicates STM32F411xD and STM32F411xE devices **STM32F412xx** **indicates STM32F412Cx, STM32F412Rx, STM32F412Vx and
STM32F412Zx devices
**STM32F413xx/423xx** **indicates STM32F413xG, STM32F413xH and STM32F423xH devices
**STM32F42xxx/43xxx** **indicates STM32F427xx, STM32F429xx, STM32F437xx, and STM32F439xx devices
**STM32F446xx** **indicates STM32F446xE and STM32F446xC devices
**STM32F469xx/479xx** **indicates STM32F469xE, STM32F469xG, STM32F469xI,
STM32F479xG, and STM32F479xI devices
**F7** **series:**
**STM32F72xxx/73xxx** **indicates STM32F722xx, STM32F723xx, STM32F732xx, and STM32F733xx devices
**STM32F74xxx/75xxx** **indicates STM32F745xx, STM32F746xx, and STM32F756xx devices
**STM32F76xxx/77xxx** **indicates STM32F765xx, STM32F767xx, STM32F769xx, STM32F777xx, and STM32F779xx devices
**G0** **series:**
**STM32G03xxx/04xxx** **indicates STM32G03xxx, and STM32G04xxx devices **STM32G07xxx/08xxx** **indicates STM32G07xxx, and STM32G08xxx devices **STM32G0B0xx **indicates STM32G0B0xx devices
**STM32G0B1xx/C1xx** **indicates STM32G0B1xx, and STM32G0C1xxx devices
**STM32G05xxx/061xx** **indicates STM32G050xx, STM32G051xx, and STM32G061xx devices
**G4** **series:**
**STM32G431xx/441xx** **indicates STM32G431xx and STM32G441xx devices
**STM32G47xxx/48xxx** **indicates STM32G471xx, STM32G473xx, STM32G474xx, STM32G483xx, and STM32G484xx devices
**STM32G491xx/A1xx** **indicates STM32G491xx and STM32G4A1xx devices
**H5** **series:**
**STM32H503xx** **indicates STM32H503xx devices
**STM32H562/63xx/73xx** **indicates STM32H562xx, STM32H563xx, and STM32H573xx devices
**STM32H523xx/33xx **indicates STM32H523xx and STM32H533xx devices **STM32H5E4xx/5E5xx** **indicates STM32H5E4xx and STM32H5E5xx devices. **STM32H5F4xx/5F5xx **indicates STM32H5F4xx and STM32H5F5xx devices.


**H7** **series:**
**STM32H72xxx/73xxx** **indicates STM32H72xxx and STM32H73xxx devices
**STM32H74xxx/75xxx** **indicates STM32H74xxx and STM32H75xxx devices
**STM32H7A3xx/7B3xx/7B0xx** **indicates STM32H7A3xx, STM32H7B3xx, and STM32H7B0xx devices
**STM32H7Rxxx/7Sxxx** **indicates STM32H7R3xx, STM32H7R7xx, STM32H7S3xx and STM32H7S7xx devices
**L0** **series:**
**STM32L01xxx/02xxx** **indicates STM32L011xx and STM32L021xx devices
**STM32L031xx/041xx** **indicates STM32L031xx and STM32L041xx devices
**STM32L05xxx/06xxx** **indicates STM32L051xx, STM32L052xx, STM32L053xx, STM32L062xx, and STM32L063xx ultra-low power devices
**STM32L07xxx/08xxx** **indicates STM32L071xx, STM32L072xx, STM32L073xx, STM32L081xx, STM32L082xx, and STM32L083xx devices
**L1** **series:**
**STM32L1xxx6(8/B)** **indicates STM32L1xxV6T6, STM32L1xxV6H6, STM32L1xxR6T6, STM32L1xxR6H6, STM32L1xxC6T6, STM32L1xxC6H6, STM32L1xxV8T6, STM32L1xxV8H6, STM32L1xxR8T6, STM32L1xxR8H6, STM32L1xxC8T6, STM32L1xxC8H6, STM32L1xxVBT6, STM32L1xxVBH6, STM32L1xxRBT6,
STM32L1xxRBH6, STM32L1xxCBT6, and STM32L1xxCBH6 ultra-low power devices
**STM32L1xxx6(8/B)A **indicates STM32L1xxV6T6-A, STM32L1xxV6H6-A, STM32L1xxR6T6-A, STM32L1xxR6H6-A, STM32L1xxC6T6-A, STM32L1xxC6H6-A, STM32L1xxV8T6-A, STM32L1xxV8H6-A, STM32L1xxR8T6-A, STM32L1xxR8H6-A, STM32L1xxC8T6-A, STM32L1xxC8H6-A, STM32L1xxVBT6-A, STM32L1xxVBH6-A, STM32L1xxRBT6-A, STM32L1xxRBH6-A, STM32L1xxCBT6-A, and
STM32L1xxCBH6-A ultra-low power devices
**STM32L1xxxC** **indicates STM32L1xxVCT6, STM32L1xxVCH6, STM32L1xxRCT6,
STM32L1xxUCY6, STM32L1xxCCT6, and STM32L1xxCCU6 ultra-low power devices
**STM32L1xxxD** **indicates STM32L1xxZDT6, STM32L1xxQDH6, STM32L1xxVDT6, STM32L1xxRDY6, STM32L1xxRDT6, STM32L1xxZCT6, STM32L1xxQCH6,
STM32L1xxRCY6, STM32L1xxVCT6-A, and STM32L1xxRCT6-A ultra-low power devices
**STM32L1xxxE** **indicates STM32L1xxZET6, STM32L1xxQEH6, STM32L1xxVET6,
STM32L1xxVEY6, and STM32L1xxRET6 ultra-low power devices


**L4** **series:**
**STM32L412xx/422xx** **indicates STM32L412xB, STM32L412x8, and STM32L422xB devices
**STM32L43xxx/44xxx** **indicates STM32L431xx, STM32L432xx, STM32L433xx and STM32L442xx, and STM32L443xx devices
**STM32L45xxx/46xxx** **indicates STM32L451xx, STM32L452xx, and STM32L462xx devices
**STM32L47xxx/48xxx** **indicates STM32L471xx, STM32L475xx, STM32L476xx, and STM32L486xx devices
**STM32L496xx/4A6xx** **indicates STM32L496xE, STM32L496xG, and STM32L4A6xG devices
**STM32L4Rxxx/4Sxxx** **indicates STM32L4R5xx, STM32L4R7xx, STM32L4R9xx, STM32L4S5xx, STM32L4S7xx, and STM32L4S9xx devices
**STM32L4P5xx/4Q5xx** **indicates STM32L4P5xx/STM32L4Q5xx devices
**L5** **series:**
**STM32L552xx/62xx** **indicates STM32L552xx and STM32L562xx devices
**U0** **series:**
**STM32U031xx** **indicates STM32U031xx devices
**STM32U073xx/83xx** **indicates STM32U073xx and STM32U083xx devices
**U3** **series:**
**STM32U375xx/385xx** **indicates STM32U375xx and STM32U385xx devices
**STM32U3B5xx/3C5xx** **indicates STM32U3B5xx and STM32U3C5xx devices
**U5** **series:**
**STM32U535xx/345xx** **indicates STM32U535xx and STM32U545xx devices
**STM32U575xx/385xx** **indicates STM32U575xx and STM32U585xxdevices
**STM32U595xx/599xx/5A5xx/5A9xx** **indicates STM32U595xx, STM32U599xx, STM32U5A5xx, and STM32U5A9xx devices
**STM32U5F7xx/5F9xx/5G7xx/5G9xx** **indicates STM32U5F7xx, STM32U5F9xx, STM32U5G7xx, and STM32U5G9xx devices
**WB** **series:**
**STM32WB10xx/15xx** **indicates STM32WB10xx and STM32WB15xx devices
**STM32WB30xx/35xx/50xx/55xx** **indicates STM32WB30xx, STM32WB35xx, STM32WB50xx, and STM32WB55xx devices
**WBA** **series:**
**STM32WBA2xxx** **indicates STM32WBA20xx, STM32WBA23xx, and STM32WBA25xx devices
**STM32WBA5xxx** **indicates STM32WBA50xx, STM32WBA52xx, STM32WBA54xx, and STM32WBA55xx devices
**STM32WBA62xx/63xx/64xx/65xx** **indicates STM32WBA54xx, STM32WBA55xx, STM32WBA64xx, and STM32WBA65xx devices
**WB0** **series:**
**STM32WB0xx** **indicates STM32WB05xx, STM32WB06xx, STM32WB07xx, and STM32WB09xx devices
**WL** **series:**


**STM32WL3xxx** **indicates STM32WL30xx, STM32WL31xx, STM32WL33xx, and STM32WL3Rxx devices
**STM32WLE5xx/55xx** **indicates STM32WLE5xx and STM32WL55xx devices

*Note:**	BL_USART_Loop** **refers** **to** **the** **USART** **bootloader** **execution** **loop.*
*BL_CAN_Loop** **refers** **to** **the** **CAN** **bootloader** **execution** **loop.** BL_FDCAN_Loop refers to the FDCAN execution loop.*
*BL_I2C_Loop** **refers** **to** **the** **I2C** **bootloader** **execution** **loop.** BL_I3C_Loop** **refers** **to** **the** **I3C** **bootloader** **execution** **loop. BL_SPI_Loop** **refers** **to** **the** **SPI** **bootloader** **execution** **loop.*

## General bootloader description


### Bootloader activation

The bootloader is activated by applying one of the patterns described in [Table 2](#_bookmark7).
If boot from Bank2 option is activated (for products supporting this feature), the bootloader executes Dual Boot mechanism as described in figures “Dual bank boot implementation for STM32xxxx” (example: [Figure 51](#_bookmark329)), otherwise bootloader selection protocol is executed as described in figures “Bootloader VY.x selection for STM32xxxx” (example: [Figure 32](#_bookmark193)), where STM32xxxx is the relative STM32 product.
When readout protection Level2 is activated, the MCU does not boot on system memory, and bootloader cannot be executed (unless jumping to it from flash user code, all commands are not accessible except Get, GetID, and GetVersion).

**Table** **2.** **Bootloader** **activation** **patterns**
| Pattern | Condition |
| --- | --- |
| Pattern 1 | Boot0(pin) = 1 and Boot1(pin) = 0 |
| Pattern 2 | Boot0(pin) = 1 and nBoot1(bit) = 1 |
| Pattern 3 | Boot0(pin) = 1, Boot1(pin) = 0 and BFB2(bit) = 1 |
|  | Boot0(pin) = 0, BFB2(bit) = 0 and both banks do not contain valid code |
|  | Boot0(pin) = 1, Boot1(pin) = 0, BFB2(bit) = 0 and both banks do not contain valid code |
| Pattern 4 | Boot0(pin) = 1, Boot1(pin) = 0 and BFB2(bit) = 1 |
|  | Boot0(pin) = 0, BFB2(bit) = 0 and both banks do not contain valid code |
|  | Boot0(pin) = 1, Boot1(pin) = 0 and BFB2(bit) = 0 |
| Pattern 5 | Boot0(pin) = 1, Boot1(pin) = 0 and BFB2(bit) = 0 |
|  | Boot0(pin) = 0, BFB2(bit) = 1 and both banks do not contain valid code |
|  | Boot0(pin) = 1, Boot1(pin) = 0 and BFB2 (bit) = 1 |
| Pattern 6 | Boot0(pin) = 1, nBoot1(bit) = 1 and nBoot0_SW(bit) = 1 |
|  | nBoot0(bit) = 0, nBoot1(bit) = 1 and nBoot0_SW(bit) = 0 |
|  | Boot0(pin) = 0, nBoot0_SW(bit) = 1 and main flash memory empty |
|  | nBoot0(bit) = 1, nBoot0_SW(bit)=0 and main flash memory empty |
| Pattern 7 | Boot0(pin) = 1, nBoot1(bit) = 1 and BFB2(bit) = 0 |
|  | Boot0(pin) = 0, BFB2(bit) = 1 and both banks do not contain valid code |
|  | Boot0(pin) = 1, nBoot1(bit) = 1 and BFB2(bit) = 1 |
| Pattern 8 | Boot(pin) = 0 and BOOT_ADD0(optionbyte) = 0x0040 |
|  | Boot(pin) = 1 and BOOT_ADD1(optionbyte) = 0x0040 |



**Table** **2.** **Bootloader** **activation** **patterns** **(continued)**
| Pattern | Condition |
| --- | --- |
| Pattern 9 | nDBANK(bit) = 1, Boot(pin) = 0 and BOOT_ADD0(optionbyte) = 0x0040 |
|  | nDBANK(bit) = 1, Boot(pin) = 1 and BOOT_ADD1(optionbyte) = 0x0040 |
|  | nDBANK(bit) = 0, nDBOOT(bit) = 1, Boot(pin) = 0 and BOOT_ADD0(optionbyte) = 0x0040 |
|  | nDBANK(bit) = 0, nDBOOT(bit) = 1, Boot(pin) = 1 and BOOT_ADD1(optionbyte) = 0x0040 |
|  | nDBANK(bit) = 0, nDBOOT(bit) = 0, BOOT_ADDx(optionbyte) out of memory range or in ICP memory range |
|  | nDBANK(bit) = 0, nDBOOT(bit) = 0, BOOT_ADDx(optionbyte) in flash memory range and both banks do not contain valid code |
| Pattern 10 | Boot(pin) = 0 and BOOT_ADD0(optionbyte) = 0x1FF0 |
|  | Boot(pin) = 1 and BOOT_ADD1(optionbyte) = 0x1FF0 |
| Pattern 11 | BOOT_LOCK(bit) = 0, nBoot1(bit) = 1, nBOOT0_SEL(bit) = 1 and nBoot0(bit) = 0 |
|  | BOOT_LOCK(bit) = 0, nBoot1(bit) = 1, Boot0(pin) = 1 and nBOOT0_SEL(bit) = 0 |
|  | BOOT_LOCK(bit) = 0, nBOOT0_SEL(bit) = 1, nBoot0(bit) = 1 and main flash empty |
|  | BOOT_LOCK(bit) = 0, Boot0(pin) = 0, nBOOT0_SEL(bit) = 0 and main flash empty |
| Pattern 12 | TZEN = 1 = 0, Boot0(pin) = 0, nSWBoot0(bit) = 1 and NSBOOTADD0 [24:0] = Address(1) |
|  | TZEN = 1 = 0, Boot0(pin) = 1, nSWBoot0(bit) = 1 and NSBOOTADD1 [24:0] = Address(1) |
|  | TZEN = 1 = 0, nBoot0(bit) = 0, nSWBoot0(bit) = 0 and NSBOOTADD1 [24:0] = Address(1) |
|  | TZEN = 0, nBoot0(bit) = 1, nSWBoot0(bit) = 0 and NSBOOTADD0 [24:0] = Address(1) |
|  | TZEN = 1, Boot0(pin) = 0, nSWBoot0(bit) = 1 and SECBOOTADD0 [24:0] = Address(1) and RSSCMD = 0 |
|  | TZEN = 1, Boot0(pin) = 1, nSWBoot0(bit) = 1 and RSSCMD = 0, BOOT_LOCK = 0 or (BOOT_LOCK = 1 and SECBOOTADD0 [24:0] = Address(1)) |
|  | TZEN = 1, nBoot0(bit) = 1, nSWBoot0(bit) = 0 and SECBOOTADD0 [24:0] = Address(1) and RSSCMD = 0, BOOT_LOCK = 0 or (BOOT_LOCK = 1 and SECBOOTADD0 [24:0] = Address(1)) |
|  | TZEN = 1, nBoot0(bit) = 0, nSWBoot0(bit) = 0 and RSSCMD = 0, BOOT_LOCK = 0 or BOOT_LOCK = 1 and SECBOOTADD1 [24:0] = Address(1) |
|  | TZEN = 1, RSSCMD = 0x1C0, BOOT_LOCK=0 or (BOOT_LOCK = 1 and SECBOOTADD0 [24:0] = Address(1)) |
| Pattern 13 | nBoot0(bit) = 0, nBoot1(bit) = 1 and nSWBoot0(bit) = 0 |
|  | nBoot0(bit) = 1, nBoot1(bit) = 1, nSWBoot0(bit) = 0 and user flash empty |
|  | nBoot1(bit) = 1, nSWBoot0(bit) = 1 and Boot0(pin) = 1 |
|  | nBoot1(bit) = 1, nSWBoot0(bit) = 1, Boot0(pin) = 0 and user flash empty |
| Pattern 14 | BOOT_LOCK(bit) = 0, nBoot1(bit) = 1, Boot0(pin) = 1 and nSWBoot0(bit) = 1 |
|  | BOOT_LOCK(bit) = 0, nBoot1(bit) = 1, nBoot0(bit) = 0 and nSWBoot0(bit) = 0 |
|  | BOOT_LOCK(bit) = 0, Boot0(pin) = 0, nSWBoot0(bit) = 1, BFB2(bit) = 1 and both banks do not contain valid code |
|  | BOOT_LOCK(bit) = 0, nBoot0(bit) = 1, nSWBoot0(bit) = 0, BFB2(bit) = 1 and both banks do not contain valid code |



**Table** **2.** **Bootloader** **activation** **patterns** **(continued)**
| Pattern | Condition |
| --- | --- |
| Pattern 15 | BOOT_LOCK(bit)=0, Boot0(pin) = 1, nBoot1(bit) = 1 and nBoot0_SW(bit) = 1 |
|  | BOOT_LOCK(bit)=0, nBoot0(bit) = 0, nBoot1(bit) = 1 and nBoot0_SW(bit) = 0 |
| Pattern 16 | Boot0(pin) = 1, nBoot1(bit) = 1 and nBoot0_SW(bit) = 1 |
|  | nBoot0(bit) = 0, nBoot1(bit) = 1 and nBoot0_SW(bit) = 0 |
|  | Boot0(pin) = 0, nBoot0_SW(bit) = 1 and main flash memory empty |
| Pattern 17 | PRODUCT_STATE = Open and Boot0(pin) = 1 |
|  | PRODUCT_STATE = Provisioning |
| Pattern 18 | Force PA10 high during HW reset |
| Pattern 19 | Boot0(bit) = 1 and BootSel(bit) = 0 Boot0(bit) = 0, BootSel(bit) = 0, and user flash empty BootSel(bit) = 1 and Boot pin = 1 |

1. Device dependent: 0x17F200 for STM32L5, STM32U5, and STM32WBA6, 0x17F1E00 for STM32U3, 0x17F1000 for STM32WBA5, 0x17F0A0 for STM32WBA2.

*Note:**	nBoot0_SW** **means** **either** **nSWBoot0** **or** **nBOOT0_SEL,** **depending** **upon** **the** **product.*
*Note:**	BOOT_LOCK** **implementation** **is** **product** **dependent.** **See** **the** **reference** **manual** **for** **more** **details.*
In addition to the patterns described above, the user can execute bootloader by performing a jump to system memory from user code. Before jumping to bootloader:
  - Disable all peripheral clocks
  - Disable used PLL
  - Disable interrupts
  - Clear pending interrupts
In some products using interrupts (integrating USB, SPI, non auto baud rate USART), interrupts must be re-enabled before jumping to the Bootloader, as this is not done by the bootloader SW.
System memory boot mode can be exited by getting out from bootloader activation condition and generating hardware reset or using Go command to execute user code.
*Note:**	When executing the Go command, the peripheral registers used by the bootloader are not** initialized** **to** **their default** **reset values** **before** **jumping** **to** **the** **user** **application. They** **must be reconfigured in the user application if they are used. So, if the application uses the IWDG, the** **IWDG** **prescaler** **value** **must** **be** **adapted** **to** **meet** **requirements** **(since** **the** **prescaler** **was set** **to** **its** **maximum value). For** **new products,** **the** **software** **resets** **all resources** **used** **by** **the bootloader** **(RCC,** **buses,** **PWR,** **PIO** **ports,** **and** **interrupts).** **Occasionally,** **not** **all** **reset** **values are set due to errors. For more information, see the known limitations for each product bootloader version.*
*Note:**	On devices with dual bank boot, to jump to system memory from user code the user must** first** **remap** **the** **system** **memory** **bootloader** **at** **address** **0x00000000** **using** **SYSCFG** **register (except for STM32F7 series), then jump to bootloader. For the STM32F7 series, the user must** **disable** **nDBOOT** **and/or** **nDBANK** **features** **(in** **option** **bytes),** **then** **jump** **to** **bootloader. For STM32L0 series, the jump to system memory from user code is not possible.*


*Note:**	For STM32 devices embedding bootloader using the DFU/CAN interface in which the** external clock source (HSE) is required for DFU/CAN operations, the** **detection of the HSE value** **is** **done** **dynamically** **by** **the** **bootloader** **firmware** **and** **is** **based** **on** **the** **internal** **oscillator clock** **(HSI,** **MSI).** **When** **(because** **of** **temperature** **variations** **or** **other** **conditions)** **the** **internal oscillator precision is altered above the tolerance band (1% around the theoretical value), the bootloader can calculate a wrong HSE frequency value. In this case, the bootloader DFU/CAN interfaces can malfunction, or not work at all.*


### Bootloader identification

Depending upon the device, the bootloader can support one or more embedded serial peripherals used to download the code to the internal flash memory. The bootloader identifier (ID) provides information about the supported serial peripherals.
For a given STM32 device, the bootloader is identified by means of the:
1. **Bootloader** **(protocol)** **version**: version of the serial peripheral (e.g. USART, CAN, USB) communication protocol used in the bootloader. This version can be retrieved using the bootloader Get Version command.
1. **Bootloader** **identifier** **(ID)**: version of the STM32 device bootloader, coded on one byte in the **0xXY **format**, **where:
–  **X** **specifies the embedded serial peripheral(s) used by the device bootloader: X = 1: one USART is used
X = 2: two USARTs are used
X = 3: USART, CAN, and DFU are used X = 4: USART and DFU are used
X = 5: USART and I2C are used
X = 6: I2C is used
X = 7: USART, CAN, DFU, and I2C are used X = 8: I2C and SPI are used
X = 9: USART, CAN (or FDCAN), DFU, I2C, and SPI are used
X = 10: USART, I2C, and DFU are used X = 11: USART, I2C, and SPI are used X = 12: USART and SPI are used
X = 13: USART, DFU, I2C, and SPI are used
X = 14: USART, DFU, I2C, I3C, FDCAN, and SPI are used X = 15: USART, USB-DFU, I2C, and I3C are used
Bootloader interface combinations have reached the maximum supported value. The solution is to extend the format to 0xXXY.
XX now specifies the serial peripheral or peripherals used by the device bootloader:
X = 16: USART, USB DFU, FDCAN, and SPI are used
X = 17: USART, SPI, and FDCAN are used
X = 18: USART, SPI, FDCAN, and I2C are used
Example: If the bootloader identification read on STM32C0 is 0x121, this means that the bootloader version is 18.1.
–	**Y** **specifies the device bootloader version
For example, if the bootloader ID is 0x10, this is the first version, which uses only one USART.
The bootloader ID is programmed in the last byte address - 1 of the device system memory and can be read by using the “Read memory” command or by direct access to the system memory via JTAG/SWD.


*Note:**	The** **bootloader** **ID** **format** **is** **applied** **to** **all** **STM32** **products,** **except** **the** **STM32F1xx** **devices.** The** **bootloader** **version** **for** **the** **STM32F1xx** **applies** **only** **to** **the** **embedded** **device** **bootloader version and not to its supported protocols.*


[Table 3](#_bookmark11)* *provides identification information of the bootloaders embedded in STM32 devices.

**Table** **3.** **Embedded** **bootloaders**
| Series | Device | Supported serial peripherals | Bootloader ID | Bootloader (protocol) version |  |
| --- | --- | --- | --- | --- | --- |
|  |  |  | ID | Memory location |  |
|  | STM32C011xx | USART1 | 0x51 | 0x1FFF17FE | USART (V3.1) |
|  |  | I2C1 |  |  | I2C1(V1.1) |
|  | STM32C031xx | USART1 | 0x52 | 0x1FFF17FE | USART (V3.1) |
|  |  | I2C1 |  |  | I2C1(V1.1) |
|  |  | USART1/USART2 |  |  | USART (V4.0) |
|  | STM32C051xx | I2C1/I2C2 | 0xB0 | 0x1FFF2FFE | I2C (V2.0) |
| C0 |  | SPI1/SPI2 |  |  | SPI (V2.0) |
|  |  | USART1/USART2 |  |  | USART (V3.1) |
|  | STM32C071xx | I2C1/I2C2 SPI1/SPI2 | 0xD1 | 0x1FFF67FE | I2C1(V1.2) SPI (V1.1) |
|  |  | USB DFU |  |  | USB (V2.2) |
|  |  | USART1/USART2/USART3 |  |  | USART (V4.0) |
|  | STM32C091xx/92xx | I2C1/I2C2 SPI1/SPI2 | 0x121 | 0x1FFF3FFE | I2C (V2.0) SPI (V2.0) |
|  |  | FDCAN1 |  |  | FDCAN (V2.2) |
|  |  | USART1/2/3 and UART4 |  |  | USART (V4.0) |
|  | STM32C5A3xx/59xxx | SPI1/2/3 FDCAN2 | 0x100 | 0x0BF885FE | SPI (V2.0) FDCAN (V2.3) |
|  |  | USB DFU |  |  | USB DFU (V3.0) |
|  |  | USART1/2/3 and UART4 |  |  | USART (V4.0) |
| C5 | STM32C55xxx/562xx | SPI1/2/3 FDCAN1 | 0x101 | 0x0BF885FE | SPI (V2.0) FDCAN (V2.3) |
|  |  | USB DFU |  |  | USB DFU (V3.0) |
|  |  | USART1/2 and UART4 |  |  | USART (V4.0) |
|  | STM32C53xxx/542xx | SPI1/2 FDCAN2 | 0x100 | 0x0BF885FE | SPI (V2.0) FDCAN (V2.3) |
|  |  | USB DFU |  |  | USB DFU (V3.0) |
|  | STM32F05xxx/STM32F030x8 | USART1/USART2 | 0x21 | 0x1FFFF7A6 | USART (V3.1) |
|  | STM32F03xx4/6 | USART1 | 0x10 | 0x1FFFF7A6 | USART (V3.1) |
|  | STM32F030xC | USART1 | 0x52 | 0x1FFFF796 | USART (V3.1) |
|  |  | I2C1 |  |  | I2C1(V1.0) |
|  |  | USART1/USART2 |  |  | USART (V3.1) |
|  | STM32F04xxx | DFU (USB device FS) I2C1 | 0xA1 | 0x1FFFF6A6 | DFU (V2.2) I2C (V1.0) |
|  |  | USART1/USART2 |  |  | USART (V3.1) |
| F0 | STM32F071xx/072xx | DFU (USB device FS) I2C1 | 0xA1 | 0x1FFFF6A6 | DFU (V2.2) I2C (V1.0) |
|  |  | USART1/USART2 |  |  | USART (V3.1) |
|  | STM32F070x6 | DFU (USB device FS) I2C1 | 0xA2 | 0x1FFFF6A6 | DFU (V2.2) I2C (V1.0) |
|  |  | USART1/USART2 |  |  | USART (V3.1) |
|  | STM32F070xB | DFU (USB device FS) I2C1 | 0xA3 | 0x1FFFF6A6 | DFU (V2.2) I2C (V1.0) |
|  | STM32F09xxx | USART1/USART2 | 0x50 | 0x1FFFF796 | USART (V3.1) |
|  |  | I2C1 |  |  | I2C (V1.0) |



**Table** **3.** **Embedded** **bootloaders** **(continued)**
| Series | Device | Supported serial peripherals | Bootloader ID | Bootloader (protocol) version |  |  |
| --- | --- | --- | --- | --- | --- | --- |
|  |  |  | ID | Memory location |  |  |
| F1 | STM32F10xxx | Low-density | USART1 | NA | NA | USART (V2.2) |
|  |  | Medium-density | USART1 | NA | NA | USART (V2.2) |
|  |  | High-density | USART1 | NA | NA | USART (V2.2) |
|  |  | Medium-density value line | USART1 | 0x10 | 0x1FFFF7D6 | USART (V2.2) |
|  |  | High-density value line | USART1 | 0x10 | 0x1FFFF7D6 | USART (V2.2) |
|  | STM32F105xx/107xx | USART1/USART2 (remapped) CAN2 (remapped) DFU (USB device) | NA | NA | USART (V2.2(1)) CAN (V2.0) DFU(V2.2) |  |
|  | STM32F10xxx XL-density | USART1/USART2 (remapped) | 0x21 | 0x1FFFF7D6 | USART (V3.0) |  |
| F2 | STM32F2xxxx | USART1/USART3 | 0x20 | 0x1FFF77DE | USART (V3.0) |  |
|  |  | USART1/USART3 CAN2 DFU (USB device FS) | 0x33 | 0x1FFF77DE | USART (V3.1) CAN (V2.0) DFU (V2.2) |  |
| F3 | STM32F373xx | USART1/USART2 DFU (USB device FS) | 0x41 | 0x1FFFF7A6 | USART (V3.1) DFU (V2.2) |  |
|  | STM32F378xx | USART1/USART2 I2C1 | 0x50 | 0x1FFFF7A6 | USART (V3.1) I2C (V1.0) |  |
|  | STM32F302xB(C)/303xB(C) | USART1/USART2 DFU (USB device FS) | 0x41 | 0x1FFFF796 | USART (V3.1) DFU (V2.2) |  |
|  | STM32F358xx | USART1/USART2 I2C1 | 0x50 | 0x1FFFF796 | USART (V3.1) I2C (V1.0) |  |
|  | STM32F301xx/302x4(6/8) | USART1/USART2 DFU (USB device FS) | 0x40 | 0x1FFFF796 | USART (V3.1) DFU (V2.2) |  |
|  | STM32F318xx | USART1/USART2 I2C1/ I2C3 | 0x50 | 0x1FFFF796 | USART (V3.1) I2C (V1.0) |  |
|  | STM32F302xD(E)/303xD(E) | USART1/USART2 DFU (USB device FS) | 0x40 | 0x1FFFF796 | USART (V3.1) DFU (V2.2) |  |
|  | STM32F303x4(6/8)/334xx/328xx | USART1/USART2 I2C1 | 0x50 | 0x1FFFF796 | USART (V3.1) I2C (V1.0) |  |
|  | STM32F398xx | USART1/USART2 I2C1/I2C3 | 0x50 | 0x1FFFF796 | USART (V3.1) I2C (V1.0) |  |



**Table** **3.** **Embedded** **bootloaders** **(continued)**
| Series | Device | Supported serial peripherals | Bootloader ID | Bootloader (protocol) version |  |
| --- | --- | --- | --- | --- | --- |
|  |  |  | ID | Memory location |  |
|  |  | USART1/USART3 |  |  | USART (V3.1) |
|  |  | CAN2 DFU (USB device FS) | 0x31 | 0x1FFF77DE | CAN (V2.0) DFU (V2.2) |
|  | STM32F40xxx/41xxx | USART1/USART3 CAN2 |  |  | USART (V3.1) CAN (V2.0) |
|  |  | DFU (USB device FS) | 0x91 | 0x1FFF77DE | DFU (V2.2) |
|  |  | I2C1/I2C2/I2C3 |  |  | SPI(V1.1) |
|  |  | SPI1/SPI2 |  |  | I2C (V1.0) |
|  |  | USART1/USART3 |  |  | USART (V3.1) |
|  |  | CAN2 DFU (USB device FS) | 0x70 | 0x1FFF76DE | CAN (V2.0) DFU (V2.2) |
|  |  | I2C1 |  |  | I2C (V1.0) |
|  | STM32F42xxx/43xxx |  |  |  |  |
|  |  | USART1/USART3 |  |  | USART (V3.1) |
|  |  | CAN2 |  |  | CAN (V2.0) |
|  |  | DFU (USB device FS) | 0x91 | 0x1FFF76DE | DFU (V2.2) |
|  |  | SPI1/ SPI2/ SPI4 |  |  | SPI(V1.1) |
|  |  | I2C1/I2C2/I2C3 |  |  | I2C (V1.0) |
|  |  | USART1/USART2 |  |  | USART (V3.1) |
|  | STM32F401xB(C) | DFU (USB device FS) SPI1/SPI2/ SPI3 | 0xD1 | 0x1FFF76DE | DFU (V2.2) SPI(V1.1) |
|  |  | I2C1/I2C2/I2C3 |  |  | I2C (V1.0) |
|  |  | USART1/USART2 |  |  | USART (V3.1) |
|  | STM32F401xD(E) | DFU (USB device FS) SPI1/SPI2/SPI3 | 0xD1 | 0x1FFF76DE | DFU (V2.2) SPI(V1.1) |
|  |  | I2C1/I2C2/I2C3 |  |  | I2C (V1.1) |
| F4 | STM32F410xx | USART1/USART2 I2C1/I2C2/I2C4 SPI1/SPI2 | 0xB1 | 0x1FFF76DE | USART (V3.1) I2C (V1.2) SPI (V1.1) |
|  |  | USART1/USART2 |  |  | USART (V3.1) |
|  | STM32F411xx | DFU (USB device FS) SPI1/SPI2/ SPI3 | 0xD0 | 0x1FFF76DE | DFU (V2.2) SPI(V1.1) |
|  |  | I2C1/I2C2/I2C3 |  |  | I2C (V1.1) |
|  |  | USART1/USART2 |  |  | USART (V3.1) |
|  |  | USART3/CAN2 |  |  | CAN (V2.0) |
|  | STM32F412xx | DFU (USB device FS) | 0x91 | 0x1FFF76DE | DFU (V2.2) |
|  |  | SPI1/SPI3/SPI4 |  |  | SPI (V1.1) |
|  |  | I2C1/I2C2/I2C3/I2C4 |  |  | I2C (V1.2) |
|  |  | USART1/USART2 |  |  | USART (V3.1) |
|  |  | USART3/CAN2 |  |  | CAN (V2.0) |
|  | STM32F413xx/423xx | DFU (USB device FS) | 0x90 | 0x1FFF76DE | DFU (V2.2) |
|  |  | I2C1/I2C2/I2C3/I2C4 |  |  | I2C (V1.2) |
|  |  | SPI1/SPI3/SPI4 |  |  | SPI (V1.1) |
|  |  | USART1/USART3 |  |  | USART (V3.1) |
|  |  | CAN2 |  |  | CAN (V2.0) |
|  | STM32F446xx | DFU (USB device FS) | 0x90 | 0x1FFF76DE | DFU (V2.2) |
|  |  | SPI1/ SPI2/SPI4 |  |  | SPI(V1.1) |
|  |  | I2C1/I2C2/I2C3 |  |  | I2C (V1.2) |
|  |  | USART1/USART3 |  |  | USART (V3.1) |
|  |  | I2C1/I2C2/I2C3 |  |  | I2C (V1.2) |
|  | STM32F469xx/479xx | CAN2 | 0x90 | 0x1FFF76DE | CAN (V2.0) |
|  |  | DFU (USB device FS) |  |  | DFU (V2.2) |
|  |  | SPI1/SPI2/ SPI4 |  |  | SPI (V1.1) |



**Table** **3.** **Embedded** **bootloaders** **(continued)**
| Series | Device | Supported serial peripherals | Bootloader ID | Bootloader (protocol) version |  |
| --- | --- | --- | --- | --- | --- |
|  |  |  | ID | Memory location |  |
|  |  | USART1/USART3 |  |  | USART (V3.1) |
|  |  | CAN1 |  |  | CAN (V2.0) |
|  | STM32F72xxx/73xxx | DFU (USB device FS) | 0x90 | 0x1FF0EDBE | DFU (V2.2) |
|  |  | I2C1/I2C2/I2C3 |  |  | I2C (V1.2) |
|  |  | SPI1/SPI2/SPI4 |  |  | SPI (V1.2) |
|  |  | USART1/USART3 |  |  | USART (V3.1) |
|  |  | I2C1/I2C2/I2C3 CAN2 | 0x70 | 0x1FF0EDBE | I2C (V1.2) CAN (V2.0) |
|  |  | DFU (USB device FS) |  |  | DFU (V2.2) |
| F7 | STM32F74xxx/75xxx |  |  |  |  |
|  |  | USART1/USART3 |  |  | USART (V3.1) |
|  |  | I2C1/I2C2/I2C3 |  |  | I2C (V1.2) |
|  |  | CAN2 | 0x90 | 0x1FF0EDBE | CAN (V2.0) |
|  |  | DFU (USB device FS) |  |  | DFU (V2.2) |
|  |  | SPI1/SPI2/SPI4 |  |  | SPI (V1.2) |
|  |  | USART1/USART3 |  |  | USART (V3.1) |
|  |  | CAN2 |  |  | CAN (V2.0) |
|  | STM32F76xxx/77xxx | DFU (USB device FS) | 0x93 | 0x1FF0EDBE | DFU (V2.2) |
|  |  | I2C1/I2C2/I2C3 |  |  | I2C (V1.2) |
|  |  | SPI1/SPI2/SPI4 |  |  | SPI (V1.2) |
|  |  | USART1/USART2/USART3 |  |  | USART (V3.1) |
|  | STM32G07xxx/08xxx | I2C1/I2C2 SPI1/SPI2 | 0xB4 | 0x1FFF6FFE | I2C (V1.2) SPI (V1.1) |
|  | STM32G03xxx/04xxx | USART1/USART2 | 0x54 | 0x1FFF1FFE | USART (V3.1) |
|  |  | I2C1\I2C2 |  |  | I2C (V1.2) |
|  |  | USART1/USART2/USART3 |  |  | USART (V3.1) |
| G0 | STM32G0B0xx | I2C1/I2C2 SPI1/SPI2 DFU (USB device FS) | 0xD0 | 0x1FFF9FFE | I2C (V1.2) SPI (V1.1) DFU (V2.2) |
|  |  | USART1/USART2/USART3 |  |  | USART (V3.1) |
|  |  | I2C1/I2C2 |  |  | I2C (V1.2) |
|  | STM32G0B1xx/0C1xx | SPI1/SPI2 | 0x92 | 0x1FFF9FFE | SPI (V1.1) |
|  |  | DFU (USB device FS) |  |  | DFU (V2.2) |
|  |  | FDCAN |  |  | FDCAN (V1.0) |
|  | STM32G05xxx/061xx | USART1/USART2 | 0x51 | 0x1FFF1FFE | USART (V3.1) |
|  |  | I2C1/I2C2 |  |  | I2C (V1.2) |
|  |  | USART1/USART2/USART3 |  |  | USART (V3.1) |
|  | STM32G431xx/441xx | I2C2/I2C3 SPI1/SPI2 | 0xD4 | 0x1FFF6FFE | I2C (V1.2) SPI (V1.1) |
|  |  | DFU (USB device FS) |  |  | DFU (V2.2) |
|  |  | USART1/USART2/USART3 |  |  | USART (V3.1) |
| G4 | STM32G47xxx/48xxx | I2C2/I2C3/I2C4 SPI1/SPI2 | 0xD5 | 0x1FFF6FFE | I2C (V1.2) SPI (V1.1) |
|  |  | DFU (USB device FS) |  |  | DFU (V2.2) |
|  |  | USART1/USART2/USART3 |  |  | USART (V3.1) |
|  | STM32G491xx/4A1xx | I2C2/I2C3 SPI1/SPI2 | 0xD2 | 0x1FFF6FFE | I2C (V1.2) SPI (V1.1) |
|  |  | DFU (USB device FS) |  |  | DFU (V2.2) |



**Table** **3.** **Embedded** **bootloaders** **(continued)**
| Series | Device | Supported serial peripherals | Bootloader ID | Bootloader (protocol) version |  |
| --- | --- | --- | --- | --- | --- |
|  |  |  | ID | Memory location |  |
|  |  | USART1/USART2/USART3 |  |  | USART (V4.0) |
|  |  | I2C2 |  |  | I2C (V2.0) |
|  | STM32H503xx | I3C1 SPI1/SPI2/SPI3 | 0xE2 | 0x0BF8FFFE | I3C (V1.0) SPI (V2.0) |
|  |  | USB DFU |  |  | USB (V3.0) |
|  |  | FDCAN1 |  |  | FDCAN (V2.0) |
|  |  | USART1/USART2/USART3 |  |  | USART (V4.0) |
|  |  | I2C3/I2C4 |  |  | I2C (V2.0) |
|  | STM32H562xx/63xx/73xx | I3C1 SPI1/SPI2/SPI3 | 0xE5 | 0x0BF9FAFE | I3C (V1.0) SPI (V2.0) |
|  |  | USB DFU |  |  | USB (V3.0) |
| H5 |  | FDCAN2 |  |  | FDCAN (V2.0) |
|  |  | USART1/USART2/USART3 |  |  | USART (V4.0) |
|  |  | I2C1/I2C3 |  |  | I2C (V2.0) |
|  | STM32H523xx/33xx | I3C1 SPI1/SPI2/SPI3 | 0xE2 | 0x0BF8FFFE | I3C (V1.0) SPI (V2.0) |
|  |  | USB DFU |  |  | USB (V3.0) |
|  |  | FDCAN2 |  |  | FDCAN (V2.0) |
|  |  | USART1/USART2/USART3 |  |  | USART (V4.0) |
|  | STM32H5Ex/5Fx | I2C3/ I2C4 I3C1 | 0xF0 | 0x0BFB5FFE | I2C (V2.0) I3C (V1.0) |
|  |  | USBHS/USBFS |  |  | USB DFU (V3.0) |
|  |  | USART1/USART2/USART3 |  |  | USART (V3.1) |
|  |  | I2C1/I2C2/I2C3 |  |  | I2C (V1.2) |
|  | STM32H72xxx/73xxx | DFU (USB device FS) | 0x93 | 0x1FF1E7FE | DFU (V2.2) |
|  |  | SPI1/SPI2/SPI3/SPI4 |  |  | SPI (V1.1) |
|  |  | FDCAN1 |  |  | FDCAN (V1.1) |
|  |  | USART1/USART2/USART3 |  |  | USART (V3.1) |
|  |  | I2C1/I2C2/I2C3 |  |  | I2C (V1.1) |
|  | STM32H74xxx/75xxx | DFU (USB device FS) | 0x92 | 0x1FF1E7FE | DFU (V2.2) |
|  |  | SPI1/SPI2/SPI3/SPI4 |  |  | SPI (V1.1) |
|  |  | FDCAN1 |  |  | FDCAN (V1.1) |
| H7 |  | USART1/USART2/USART3 I2C1/I2C2/I2C3 |  |  | USART (V3.1) I2C (V1.2) |
|  | STM32H7A3xx/7B3xx/7B0xx | DFU (USB device FS) | 0x92 | 0x1FF13FFE | DFU (V2.2) |
|  |  | SPI1/SPI2/SPI3 |  |  | SPI (V1.2) |
|  |  | FDCAN1 |  |  | FDCAN (V1.1) |
|  |  | USART1/USART2/USART3 UART4 I2C1/I2C2/I2C3 | 0xE3 (RevY) |  | USART (V4.0)  I2C (V2.0) |
|  | STM32H7Rxxx/7Sxxx | DFU (USB device FS) |  | 0x1FF1FCFE | DFU (V2.2) |
|  |  |  |  |  |  |
|  |  | SPI1/SPI2/SPI3 FDCAN2 I3C1 | 0xE5 (Rev B) |  | SPI (V2.0) FDCAN (V2.1) I3C (V1.0) |



**Table** **3.** **Embedded** **bootloaders** **(continued)**
| Series | Device | Supported serial peripherals | Bootloader ID | Bootloader (protocol) version |  |
| --- | --- | --- | --- | --- | --- |
|  |  |  | ID | Memory location |  |
| L0 | STM32L01xxx/02xxx | USART2 SPI1 | 0xC3 | 0x1FF00FFE | USART (V3.1) SPI (V1.1) |
|  | STM32L031xx/041xx | USART2 SPI1 | 0xC0 | 0x1FF00FFE | USART (V3.1) SPI (V1.1) |
|  | STM32L05xxx/06xxx | USART1/USART2 SPI1/ SPI2 | 0xC0 | 0x1FF00FFE | USART (V3.1) SPI (V1.1) |
|  | STM32L07xxx/08xxx | USART1/USART2 DFU (USB device FS) | 0x41 | 0x1FF01FFE | USART (V3.1) DFU (V2.2) |
|  |  | USART1/USART2 SPI1/SPI2 I2C1/I2C2 | 0xB2 | 0x1FF01FFE | USART (V3.1) SPI (V1.1) I2C (V1.2) |
| L1 | STM32L1xxx6(8/B) | USART1/USART2 | 0x20 | 0x1FF00FFE | USART (V3.0) |
|  | STM32L1xxx6(8/B)A | USART1/USART2 | 0x20 | 0x1FF00FFE | USART (V3.1) |
|  | STM32L1xxxC | USART1/USART2 DFU (USB device FS) | 0x40 | 0x1FF01FFE | USART (V3.1) DFU (V2.2) |
|  | STM32L1xxxD | USART1/USART2 DFU (USB device FS) | 0x45 | 0x1FF01FFE | USART (V3.1) DFU (V2.2) |
|  | STM32L1xxxE | USART1/USART2 DFU (USB device FS) | 0x40 | 0x1FF01FFE | USART (V3.1) DFU (V2.2) |



**Table** **3.** **Embedded** **bootloaders** **(continued)**
| Series | Device | Supported serial peripherals | Bootloader ID | Bootloader (protocol) version |  |
| --- | --- | --- | --- | --- | --- |
|  |  |  | ID | Memory location |  |
| L4 | STM32L412xx/422xx | USART1/USART2/USART3 I2C1/I2C2/I2C3 DFU (USB device FS) SPI1/SPI2 | 0xD1 | 0x1FFF6FFE | USART (V3.1) I2C (V1.2) DFU (V2.2) SPI (V1.1) |
|  | STM32L43xxx/44xxx | USART1/USART2/USART3 I2C1/I2C2/I2C3 CAN1 DFU (USB device FS) SPI1/SPI2 | 0x91 | 0x1FFF6FFE | USART (V3.1) I2C (V1.2) CAN (V2.0) DFU (V2.2) SPI (V1.1) |
|  | STM32L45xxx/46xxx | USART1/USART2/USART3 I2C1/I2C2/I2C3 CAN1 DFU (USB device FS) SPI1/SPI2 | 0x92 | 0x1FFF6FFE | USART (V3.1) I2C (V1.2) CAN (V2.0) DFU (V2.2) SPI (V1.1) |
|  | STM32L47xxx/48xxx | USART1/USART2/ USART3 I2C1/I2C2/I2C3 DFU (USB device FS) | 0xA3 | 0x1FFF6FFE | USART (V3.1) I2C (V1.2) DFU (V2.2) |
|  |  | USART1/USART2/ USART3 I2C/I2C2/I2C3 SPI1/SPI2 CAN1 DFU (USB device FS) | 0x92 | 0x1FFF6FFE | USART (V3.1) I2C (V1.2) SPI (V1.1) CAN(V2.0) DFU(V2.2) |
|  | STM32L496xx/4A6xx | USART1/USART2/USART3 I2C1/I2C2/I2C3 CAN1 DFU (USB device FS) SPI1/SPI2 | 0x93 | 0x1FFF6FFE | USART (V3.1) I2C (V1.2) CAN (V2.0) DFU (V2.2) SPI (V1.1) |
|  | STM32L4Rxxx/STM32L4Sxxx | USART1/USART2/USART3 I2C1/I2C2/I2C3 CAN1 DFU (USB device FS) SPI1/SPI2 | 0x95 | 0x1FFF6FFE | USART (V3.1) I2C (V1.2) CAN (V2.0) DFU (V2.2) SPI (V1.1) |
|  | STM32L4P5xx/Q5xx | USART1/USART2/USART3 I2C1/I2C2/I2C3 CAN1 DFU (USB device FS) SPI1/SPI2 | 0x90 | 0x1FFF6FFE | USART (V3.1) I2C (V1.2) CAN (V2.0) DFU (V2.2) SPI (V1.1) |
| L5 | STM32L552xx/562xx | USART1/USART2/USART3 I2C1/I2C2/I2C3 SPI1/SPI2/SPI3 DFU (USB device FS) FDCAN1 | 0x92 | 0x0BF97FFE | USART (V3.1) I2C (V1.2) SPI (V1.1) DFU (V2.2) FDCAN (V1.0) |



**Table** **3.** **Embedded** **bootloaders** **(continued)**
| Series | Device | Supported serial peripherals | Bootloader ID | Bootloader (protocol) version |  |
| --- | --- | --- | --- | --- | --- |
|  |  |  | ID | Memory location |  |
| U0 | STM32U031xx | USART1/USART2/USART3 I2C1/I2C2/I2C3 SPI1/SPI2 | 0xB0 | 0x1FFF37FE | USART (V3.1) I2C (V1.2) SPI (V1.1) |
|  | STM32U073xx/83xx | USART1/USART2/USART3 I2C1/I2C2/I2C3 SPI1/SPI2 DFU (USB device FS) | 0xD0 | 0x1FFF67FE | USART (V3.1) I2C (V1.2) SPI (V1.1) DFU (V2.2) |
| U3 | STM32U375xx/385xx | USART1/USART3 I2C1/I2C2/I2C3 I3C1 SPI1/SPI2/SPI3 DFU (USB device FS) FDCAN1 | 0xE2 | 0x0BF98FFE | USART(V4.0) I2C (V2.0) I3C(V1.0) SPI (V2.0) DFU (V3.0) FDCAN (V2.2) |
|  | STM32U3B5xx/3C5xx | USART1/USART3 I2C1/I2C2/I2C3 SPI1/SPI2/SPI3 I3C1 FDCAN1 USB DFU | 0xE0 | 0x0BF98FFE | USART (V4.0) I2C (V2.0) SPI (V2.0) I3C (V1.0) FDCAN (V2.2) USB DFU (V3.0) |
| U5 | STM32U535xx/545xx | USART1/USART3 I2C1/I2C2/I2C3 SPI1/SPI2/SPI3 DFU (USB device FS) FDCAN1 | 0x91 | 0x0BF99EFE | USART (V3.1) I2C (V1.2) SPI (V1.1) DFU (V2.2) FDCAN (V1.1) |
|  | STM32U575xx/585xx | USART1/USART2/USART3 I2C1/I2C2/I2C3 SPI1/SPI2/SPI3 DFU (USB device FS) FDCAN1 | 0x93 | 0x0BF99EFE | USART (V3.1) I2C (V1.2) SPI (V1.1) DFU (V2.2) FDCAN (V1.1) |
|  | STM32U595xx/599xx/ STM32U5A5xx/5A9xx | USART1/USART2/USART3 I2C1/I2C2/I2C3 SPI1/SPI2/SPI3 DFU (USB device HS) FDCAN1 | 0x92 | 0x0BF99EFE | USART (V3.1) I2C (V1.2) SPI (V1.1) DFU (V2.2) FDCAN (V1.1) |
|  | STM32U5F7xx/5F9xx/ STM32U5G7xx/5G9xx | USART1/USART2/USART3 I2C1/I2C2/I2C3 SPI1/SPI2/SPI3 DFU (USB device HS) FDCAN1 | 0x90 | 0x0BF99EFE | USART (V3.1) I2C (V1.2) SPI (V1.1) DFU (V2.2) FDCAN (V1.1) |
| WB | STM32WB10xx/15xx | USART1 I2C1 SPI1 | 0xB1 | 0x1FFF6FFE | USART (V3.1) I2C (V1.2) SPI (V1.1) |
|  | STM32WB30xx/35xx/50xx/55xx | USART1 I2C1/I2C3 SPI1/SPI2 DFU (USB device FS) | 0xD5 | 0x1FFF6FFE | USART (V3.2) I2C (V1.2) SPI (V1.1) DFU (V2.2) |



**Table** **3.** **Embedded** **bootloaders** **(continued)**
| Series | Device | Supported serial peripherals | Bootloader ID | Bootloader (protocol) version |  |
| --- | --- | --- | --- | --- | --- |
|  |  |  | ID | Memory location |  |
| WBA | STM32WBA2xxx | USART1 SPI3 I2C1/3 USB DFU | 0xD0 | 0x0BF8CCFE | USART (V4.0) SPI (V2.0) I2C (V2.0) USB DFU (V3.0) |
|  | STM32WBA5xxx | USART1/USART2 I2C1/I2C3 SPI3 | 0xB0 (revA), 0xB1 (revB) | 0x0BF8FEFE | USART (V3.1) I2C (V1.2) SPI (V1.1) |
|  | STM32WBA62xx/63xx/64xx/65xx | USART1/USART2 I2C1/I2C3 SPI2/SPI3 DFU (USB device FS) | 0xD2 | 0x0BF97EFE | USART (V4.0) I2C (V2.0) SPI (V2.0) DFU (V3.0) |
| WB0 | STM32WB05xx | USART1 | NA | NA | USART (V2.0) |
|  | STM32WB06xx/7xx |  |  |  | USART (V4.0) |
|  | STM32WB09xx |  |  |  | USART (V1.0) |
| WL | STM32WL3xxx | USART | NA | NA | USART (V4.0) |
|  | STM32WLE5xx/55xx | USART1/USART2 SPI1/SPI2 | 0xC4 | 0x1FFF3EFE | USART (V3.1) SPI (V1.1) |

1. For connectivity line devices, the USART bootloader returns V2.0 instead of V2.2 for the protocol version. For more details refer to the “STM32F105xx and STM32F107xx revision Z” errata sheet available from [www.st.com.](http://www.st.com/)

### Hardware connection requirements

To use the USART bootloader, the host must be connected to the RX and TX pins of the desired USARTx interface via a serial cable.

**Figure** **1.** **USART** **connection**














1. A pull-up resistor must be added, if they are not connected on host side.
1. An RS232 transceiver must be connected to adapt the voltage level (3.3 to 12 V) between the STM32 device and the host.
*Note:**	Typically** **V** **is** **3.3** **V,** **and** **R** **is** **100** **K*Ω*.** **These** **values** **depend** **upon** **the** **application** **and** **the** used hardware.*


To use the DFU, connect the microcontroller USB interface to a USB host (such as a PC).

**Figure** **2.** **USB** **connection**
















1. This additional circuit permits to connect a pull-up resistor to DP pin using VBus when needed. Refer to product section (table describing STM32 configuration in system memory boot mode) to know if an external pull-up resistor must be connected to DP pin.
*Note:**	V** **typically** **is** **3.3** **V.** **This** **value** **depends** **upon** **the** **application** **and** **the** **used** **hardware.*
To use the I2C bootloader, connect the host (controller) and the desired I2Cx interface (target) together via the data (SDA) and clock (SCL) pins. A 1.8 KΩ pull-up resistor must be connected to both SDA and SCL lines.

**Figure** **3.** **I2C** **connection**














*Note:**	V** **is** **typically** **3.3** **V.** **This** **value** **depends** **upon** **the** **application** **and** **the** **used** **hardware.*


To use the SPI bootloader, connect the host (master) and the desired SPIx interface (slave) together via the MOSI, MISO, SCK, and NSS pins. A pull-down resistor must be connected to the SCK line.


**Figure** **4.** **SPI** **connection**

| SPI host | NSS	NSS | STM32 |
| --- | --- | --- |
|  | MOSI	MOSI |  |
|  | MISO	MISO |  |
|  | SCK	SCK |  |
|  | GND	GND |  |
|  |  |  |



*Note:**	The** **resistor** **is** **typically** **10** **KΩ,** **its** **value** **depends** **upon** **the** **application** **and** **the** **used** **hardware.*


To use the CAN interface, the host must be connected to the RX and TX pins of the desired CANx interface via CAN transceiver and a serial cable. A 120 Ω resistor must be added as terminating resistor.

**Figure** **5.** **CAN** **connection**












*Note:**	When a bootloader firmware supports DFU, it is mandatory that no USB host is connected** to the USB peripheral during the selection phase of the other interfaces.** **After selection phase,** **the** **user** **can** **plug** **a** **USB** **cable** **without** **impacting** **the** **selected** **bootloader** **execution, except for commands generating a system reset.*
It is recommended to keep the RX pins of unused bootloader interfaces (USART_RX, SPI_MOSI, and CAN_RX, if present) at a known (low or high) level and keep the USB D+/D-lines, if present, on the same level (low/high) at the startup of the bootloader (detection phase). Leaving these pins floating during the detection phase can result in activation of unused interfaces.


### Bootloader memory management

All write operations using bootloader commands must be word-aligned (the address must be a multiple of 4). The number of data to write must be a multiple of 4 as well (non-aligned half page write addresses are accepted).


Some products embed a bootloader with specific features:
- On products that do not support mass erase operation, to perform this operation using the bootloader, two options are available:
  - Erase all sectors one by one using the Erase command
  - Set protection level to Level 1. Then, set it to Level 0 (using the Read protect and then the Read unprotect command). This operation results in a mass erase of the internal flash memory.
- Bootloader firmware of STM32 L1 and L0 series supports Data memory in addition to standard memories (internal flash, internal SRAM, option bytes and System memory). The start address and the size of this area depends on product, refer to the reference manual for more information. Data memory can be read and written but cannot be erased using the Erase command. When writing in a Data memory location, the bootloader firmware manages the erase operation of this location before any write. A write to Data memory must be word-aligned (address to be written must be a multiple of 4) and the number of data must also be a multiple of 4. To erase a Data memory location, write 0s at this location.
- Bootloader firmware of the F2, F4, F7, and L4 series supports OTP memory in addition to standard memories (internal flash, internal SRAM, option bytes and System memory). The start address and the size of this area depends on product, refer to the reference manual for more information. OTP memory can be read and written but cannot be erased using Erase command. When writing in an OTP memory location, make sure that the relative protection bit is not reset.
- For STM32 F2, F4, and F7 series the internal flash memory write operation format depends on voltage range. By default write operations are allowed by one byte format (half-word, word, and double-word operations are not allowed). To increase the speed of write operation, the user must apply the adequate voltage range that allows write operation by half-word, word or double-word and update this configuration on the fly by the bootloader software through a virtual memory location. This memory location is not physical but can be read and written using usual bootloader read/write operations according to the protocol in use. This memory location contains four bytes, described in [Table 4](#_bookmark19). It can be accessed by 1, 2, 3, or 4 bytes. However, reserved bytes must remain at their default values (0xFF), otherwise the request is NACK-ed.

**Table** **4.** **STM32** **F2,** **F4,** **and** **F7** **voltage** **range** **configuration** **using** **bootloader**
| Address | Size | Description |
| --- | --- | --- |
| 0xFFFF0000 | 1 byte | This byte controls the current value of the voltage range. 0x00: voltage range [1.8 V, 2.1 V] 0x01: voltage range [2.1 V, 2.4 V] 0x02: voltage range [2.4 V, 2.7 V] 0x03: voltage range [2.7 V, 3.6 V] 0x04: voltage range [2.7 V, 3.6 V] and double word write/erase operation is used. In this case it is mandatory to supply 9 V through the VPP pin (refer to the product reference manual for more details about the double-word write procedure). Others: all other values are not supported and are NACK-ed. |



| Address | Size | Description |
| --- | --- | --- |
| 0xFFFF0001 | 1 byte | Reserved. 0xFF is the default value, all other values are not supported and are NACK-ed. |
| 0xFFFF0002 | 1 byte |  |
| 0xFFFF0003 | 1 byte |  |


[Table 5](#_bookmark20)* *lists the valid memory areas, depending upon the bootloader commands.

**Table** **5.** **Supported** **memory** **area** **by** **Write,** **Read,** **Erase,** **and** **Go** **commands**
| Memory area | Write command | Read command | Erase command | Go command |
| --- | --- | --- | --- | --- |
| Flash | Supported | Supported | Supported | Supported |
| RAM | Supported | Supported | Not supported | Supported |
| System memory | Not supported | Supported | Not supported | Not supported |
| Data memory | Supported | Supported | Supported(1) | Not supported |
| OTP memory | Supported | Supported | Not supported | Not supported |

1. Depending on the STM32 device, the erase method varies:
  - Write 0 to the data memory address on STM32L0 and STM32L1 devices.
  - Use flash erase when the data memory corresponds to flash sectors, for example, STM32H57xx/8xx devices.
  - Use a special command to erase, as described in the STM32 paragraph.

### Bootloader UART baudrate detection

For the UART interface baudrate detection, there are two implemented mechanisms:
- Software baudrate detection using internal HSI and timer (use GPIO as input, detect falling edge and rising edge as explained in AN3155).
The devices using this mechanism are subject to software jitter (variable error of baudrate calculation) that can reach up to ±5%. In this case, the host connecting to the STM32 bootloader UART interface must support a ±5% deviation in baudrate.
The software jitter value is variable and different at each retry, so it is possible to use multiple retry connections to overcome it. Connect and check for correct bootloader answer, if the answer is not correct, reset the device and retry connection until the correct answer is received. At this point, the rest of the communication is not impacted. It is also possible to reduce the software jitter by reducing the baudrate (as an example, use 56000 instead of 115200 bps).
[Table 6](#_bookmark22)* *provides the maximum software jitter value for the 115200 bps baudrate. The lower the baudrate, the lower the software jitter.
- Baudrate detection using UART auto-baudrate feature. Devices using this mechanism do not present any software jitter.


**Table** **6.** **Jitter** **software** **calculation** **on** **bootloader** **USART** **detection**
| Series or product | Detection method | Maximum software jitter |
| --- | --- | --- |
| STM32C011xx | Auto-baudrate | Not applicable |
| STM32C031xx |  |  |
| STM32C051xx USART1 |  |  |
| STM32C051xx USART2 | Software baudrate detection | -2% |
| STM32C071xx USART1 | Auto-baudrate | Not applicable |
| STM32C071xx USART2 | Software baudrate detection | -2% |
| STM32C091xx/92xx USART1 | Auto-baudrate | Not applicable |
| STM32C091xx/92xx USART2/3 | Software baudrate detection | -2% |
| STM32C5 | Auto-baudrate | Not applicable |
| STM32F0 | Software baudrate detection | -1% |
| STM32F1 |  | -3% |
| STM32F2 |  | -5% |
| STM32F3 |  | -2% |
| STM32F4 |  | -6% |
| STM32F7 |  | -6% |
| STM32G05xxx/061xx USART1 | Auto-baudrate | Not applicable |
| STM32G05xxx/061xx USART2 | Software baudrate detection | -2% |
| STM32G07/8x USART3 STM32G03/4x USART2 |  | -4% |
| STM32G07/8x USART1/USART2 STM32G03/4x USART1 | Auto-baudrate | Not applicable |
| STM32G0B/Cxxx |  |  |
| STM32G4 |  |  |
| STM32H5 |  |  |
| STM32H7 |  |  |
| STM32L0 | Software baudrate detection | -2% |
| STM32L1 |  | -3% |
| STM32L4 |  | -5% |
| STM32L5 | Auto-baudrate | Not applicable |
| STM32U031xx USART1/2 |  |  |
| STM32U073/83xx USART1/2 |  |  |
| STM32U073/83xx USART3 | Software baudrate detection | -2% |



**Table** **6.** **Jitter** **software** **calculation** **on** **bootloader** **USART** **detection** **(continued)**
| Series or product | Detection method | Maximum software jitter |
| --- | --- | --- |
| STM32U3 | Auto-baudrate | Not applicable |
| STM32U5 |  |  |
| STM32WB |  |  |
| STM32WBA |  |  |
| STM32WB0 |  |  |
| STM32WL |  |  |


### Programming constraints

When using the bootloader interface to write in the flash memory, respect the alignment on the programmed address detailed in [Table 7](#_bookmark24). If the address is not aligned, the operation fails, and all following program operations fail as well.

**Table** **7.** **Flash** **memory** **alignment** **constraints**
| Series | Alignment |
| --- | --- |
| STM32C0 | 8 bytes |
| STM32C5 | 16 bytes |
| STM32F0 | 4 bytes |
| STM32F1 | 4 bytes |
| STM32F2 | 4 bytes |
| STM32F3 | 4 bytes |
| STM32F4 | 4 bytes |
| STM32F7 | 8 bytes |
| STM32G0 | 4 bytes |
| STM32G4 | 8 bytes |
| STM32H5 | 16 bytes |
| STM32H7 | 16 bytes (H7Rxx/H7Sxx devices) |
|  | 8 bytes (all other devices) |
| STM32L0 | 8 bytes |
| STM32L1 | 8 bytes |
| STM32L4 | 8 bytes |
| STM32L5 | 16 bytes |
| STM32U0 | 8 bytes |
| STM32U3 | 8 bytes |
| STM32U5 | 16 bytes |
| STM32WB | 8 bytes |



**Table** **7.** **Flash** **memory** **alignment** **constraints** **(continued)**
| Series | Alignment |
| --- | --- |
| STM32WBA | 16 bytes |
| STM32WB0 | 4 bytes |
| STM32WL | 4 bytes (STM32WL3xxx) |
|  | 8 bytes (STM32WLE5xx/55xx) |


Examples of alignment:
- 4 bytes: 0x0800 0014 is aligned and passes, 0x0800 0012 is not aligned and fails
- 8 bytes: 0x0800 0010 is aligned and passes, 0x0800 0014 is not aligned and fails
*Note:**	On** **STM32F4** **and** **STM32F7** **it** **is** **possible** **to** **change** **the** **alignment** **constraint** **by** **writing** **in** the device feature space.*


### ExitSecureMemory feature

The securable memory area is used to isolate secure boot code/data, which handles sensitive information (secrets), from application code. The secure boot code access is controlled by HW (FLASH registers and option bytes, depending on the product). The code is executed once at boot, then locked by HW until the next reset.
The ExitSecureMemory is a software hosted on the system memory. When the user boot code jumps to it, it is possible to enable the hide protection area, and then jump to the application code. The size of the hide protection area (HDP) must be set by the user to the needed value before jumping to the ExitSecureMemory function.

#### ExitSecureMemory v1.0

As shown in [Figure 6](#_bookmark27), two methods can be used.
      1. Jump to the secure memory function without parameters: the application must be loaded just after the defined secure memory area (HDP and size).
      1. Jump to the secure memory function using two parameters:
        1. Magic number: 0x08192A3C is used to secure boot code/data in flash/Bank1 and jump in case of a single/dual bank product, 0x08192A3D is used to secure boot code/data and jump to application in Bank2 in case of a dual bank product
        1. User address = Application address: the application can be loaded to any desired address


**Figure** **6.** **ExitSecureMemory** **function** **usage**








For more information regarding the option bytes configuration, see the reference manual. For examples of functions that can be used to call ExitSecureMemory, see [Appendix A](#_bookmark827). For more details refer to [Figure 7](#_bookmark28).


**Figure** **7.** **Access** **to** **securable** **memory** **area** **from** **the** **bootloader**





























1. The bootloader does not check the integrity of the user address, it is up to the user to ensure the validity of the address to jump to.

#### ExitSecureMemory v1.1

Compared to the ExitSecureMemory v1.0, the user can define an MPU region. This is done using the CPU R3 register, before jumping to the software, that runs as shown in [Figure 8](#_bookmark30).

**Figure** **8.** **Defining** **an** **MPU** **region**


**Table** **8.** **ExitSecureMemory** **entry** **address**
| MCU | ExitSecureMemory address | Version address | Version |  |
| --- | --- | --- | --- | --- |
| STM32G0 | STM32G07xxx/08xxx | 0x1FFF6800 | Not available | V1.0 |
|  | STM32G03xxx/04xxx | 0x1FFF1E00 |  |  |
|  | STM32G0Bxxx/0Cxxx | 0x1FFF6800 |  |  |
|  | STM32G05xxx/061xx | 0x1FFF6800 |  |  |
| STM32G4 | STM32G47xxx/48xxx | 0x1FFF6800 |  |  |
|  | STM32G431xx/441xx | 0x1FFF6800 |  |  |
|  | STM32G491xx/4A1xx | 0x1FFF6800 |  |  |
| STM32C0 | STM32C011xx | 0x1FFF1600 |  |  |
|  | STM32C031xx | 0x1FFF1600 |  |  |
|  | STM32C051xx | 0x1FFF2E00 | 0x1FFF2F8C | V1.1 (0x11) |
|  | STM32C071xx | 0x1FFF1600 | 0x1FFF618C |  |
|  | STM32C091xx/92xx | 0x1FFF3E00 | 0x1FFF3F8C |  |
| STM32C5 | STM32C5xxx | 0x0BF88400 | 0x0BF883E8 | V2.0 (0x20) |
| STM32U0 | STM32U031xx | 0x1FFF3500 | 0x1FFF368C | V1.1 (0x11) |
|  | STM32U073xx/83xx | 0x1FFF6000 | 0x1FFF618C |  |


### IWDG usage

The bootloader does not enable IWDG. It tries to update the prescaler value if the IWDG was enabled by HW (through option bytes) or by SW in case of an application that jumps to bootloader.
If the IWDG was not enabled before the boot on bootloader (using HW boot or by a jump from an application), the watchdog prescaler value update bit (PVU) is set to 1 when the bootloader tries to change the prescaler value.
This value does not change, it remains at 0x1 as the prescaler update never happens (IWDG is not enabled), even after the jump. When using the bootloader to jump to the application, and when there is the need to enable the IWDG, consider that the PVU bit in the IWDG_SR register is set to 1.


### Bootloader models

To address the evolution of STM32 devices on security, the bootloader (BL) is now available on different models.


1. Legacy model - BL_V1 (see left side of [Figure 9](#_bookmark34)):
The system memory is non secure and allocated to the bootloader. In some projects a SW (functionally independent from the bootloader) called ExitSecureMemory is implemented on the same zone as the BL.
1. New BL model - BL_V2 (see right side of [Figure 9](#_bookmark34))
The system memory is split between secure and nonsecure areas. The secure area contains the System Flash Secure Package (SFSP), the nonsecure contains the BL.

**Figure** **9.** **BL_V1** **(left)** **and** **BL_V2** **(right)** **models**












### Boot constraints on BL

Boot depends upon the MCU (see [Table 9](#_bookmark36)), and adds new constraints to the BL.
- Legacy products - Boot_V1
When correctly set, the boot is directly on the BL (left side of [Figure 10](#_bookmark37))
- Products with security but no TrustZone isolation - Boot_V2 (right side of [Figure 10](#_bookmark37))
When correctly set and boot on the BL is possible, the boot starts on the SFSP, then it jumps to the bootloader. This adds a constraint to the boot timing.
- Products with security using TrustZone isolation - Boot_V3 On this category there are two possibilities:
  1. Boot depending on TrustZone value - Boot_V3_1 (see [Figure 11](#_bookmark38))
When TZEN is enabled, some constraints are added to the BL functionalities:
    - Boot timing is different from the TZEN disabled use case
    - Before jumping to the BL, the SFSP maps all the needed resources by the BL to the nonsecure domain. A jump from the BL (“Go” command) to an application using other resources does not work.
    - Some secure option bytes are not be accessible as the bootloader is nonsecure. Some APIs are added on the SFSP to guarantee that the BL can modify them on open products states (Open, RDP L0).
    - Some parts of the SRAM are used by the SFSP and remain on Secure domain when jumping to the BL, so are not accessible by the customer through BL
  1. Boot not depending on TrustZone value - Boot_V3_2 (see [Figure 12](#_bookmark39))


Boot goes through SFSP first, then jumps to the BL. In this model, some constraints are added to the BL functionalities on both TZEN states:
    - Boot timing includes SFSP timing.
    - Before jumping to the BL, the SFSP map all the needed resources by the BL to the nonsecure domain. A jump from the BL (“Go” command) to an application using other resources does not work.
    - Some secure option bytes are not be accessible by the Bootloader as it is nonsecure. Some APIs are added on the SFSP to guarantee that the BL can modify them on open products states (Open).
    - Some parts of the SRAM are used by the SFSP and remain on Secure domain when jumping to the BL, consequently they are not accessible by the customer through BL.

**Table** **9.** **BL** **and** **boot** **by** **product** **series**
| Series | BL model | Boot |
| --- | --- | --- |
| STM32H7 | BL_V2 | Boot_V2 (see Figure 10) |
| STM32L5, STM32U3, STM32U5, STM32WBA |  | Boot_V3_1 (see Figure 11) |
| STM32H5 |  | Boot_V3_2 (see Figure 12) |
| Others | BL_V1 | Boot_V1 (see Figure 10) |


**Figure** **10.** **Boot_V1** **(left)** **and** **Boot_V2** **(right)**



**Figure** **11.** **Boot_V3_1**




**Figure** **12.** **Boot_V3_2**





### Bootloader configuration

The STM32C011xx bootloader is activated by applying Pattern 11 (see [Table 2](#_bookmark7)). [Table 10](#_bookmark42)
shows the hardware resources used by this bootloader.

**Table** **10.** **STM32C011xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 24 MHz (no PLL) |
|  | RAM | - | 3.5 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 6 Kbytes, starting from address 0x1FFF0000 contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset if the hardware IWDG option was previously enabled by the user. |
| Securable memory area | - | - | The address to jump to for the securable memory area is 0x1FFF1600 |
| USART1 | USART1 | Enabled | Once initialized, the USART1 configuration is 8 bits, even parity, and one stop bit. |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in input pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1100100x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain pull-up mode |
|  | I2C1_SDA pin |  | PB7 pin: data line is used in open-drain pull-up mode |


*Note:**	On** **WLCSP12,** **SO8N,** **TSSOP20,** **and** **UFQFN20** **packages** **USART1** **PA9/PA10** **IOs** **are** remapped on PA11/PA12.*

### Bootloader selection

[Figure 13](#_bookmark44)* *shows the bootloader selection mechanism.

**Figure** **13.** **Bootloader** **V5.x** **selection** **for** **STM32C011xx** **devices**






















### Bootloader version

[Table 11](#_bookmark46)* *lists the STM32C011xx devices bootloader versions.

**Table** **11.** **STM32C011xx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V5.1 | Initial bootloader version | None |





### Bootloader configuration

The STM32C031xx bootloader is activated by applying Pattern 11 (see [Table 2](#_bookmark7)). [Table 12](#_bookmark49)
shows the hardware resources used by this bootloader.

**Table** **12.** **STM32C031xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 24 MHz (no PLL) |
|  | RAM | - | 3.5 Kbytes, starting from address 0x20000000, are used by the bootloader firmware. |
|  | System memory | - | 6 Kbytes, starting from address 0x1FFF0000, contain the bootloader firmware. |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset if the hardware IWDG option was previously enabled by the user. |
| Securable memory area | - | - | The address to jump to for the securable memory area is 0x1FFF1600 |
| USART1 | USART1 | Enabled | Once initialized, the USART1 configuration is 8 bits, even parity, and one stop bit. |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in input pull-up mode. PA12 pin: remapped to PA10, as this pin does is not available on TSOPP20 and UFQFPN28 packages. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. PA11 pin: remapped to PA9, as this pin does is not available on TSOPP20 and UFQFPN28 packages. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1100011x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin |  | PB7 pin: data line is used in open-drain no pull mode. |


### Bootloader selection

[Figure 14](#_bookmark51)* *shows the bootloader selection mechanism.

**Figure** **14.** **Bootloader** **V5.x** **selection** **for** **STM32C031xx** **devices**






















### Bootloader version

[Table 13](#_bookmark53)* *lists the STM32C031xx devices bootloader versions.

**Table** **13.** **STM32C031xx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V5.2 | Initial bootloader version | None |





### Bootloader configuration

The STM32C051xx bootloader is activated by applying Pattern 11 (see [Table 2](#_bookmark7)). [Table 14](#_bookmark56)
shows the hardware resources used by this bootloader.

**Table** **14.** **STM32C051xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 24 MHz, derived directly from the HSI |
|  | RAM | - | 5 Kbytes, starting from address 0x2000 0000, are used by the bootloader firmware. |
|  | System memory | - | 12 Kbytes, starting from address 0x1FFF 0000, contain the bootloader firmware. |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset if the hardware IWDG option was previously enabled by the user. |
| Securable memory area | - | - | The address to jump to for the securable memory area is 0x1FFF 2E00 |
| USART1 | USART1 | Enabled | Once initialized, the USART1 configuration is 8 bits, even parity, and one stop bit. |
|  | USART1_RX pin | Input | PA10 pin: USART in reception mode. PA12 pin: as PA10 pin does not exist on WLCSP15, TSSOP20, and UFQFN28, PA12 is remapped to PA10. Used in alternate function with pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART in transmission mode. PA11 pin: as PA9 pin does not exist on WLCSP15, TSSOP20, and UFQFN28, PA11 is to PA9. Kept in reset configuration until 0x7F detected on USART_RX. |
| USART2 | USART2 | Enabled | Once initialized, the USART2 configuration is 8 bits, even parity, and one stop bit. |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in alternate function, pull-up mode |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Kept in reset configuration until 0x7F detected on USART_RX |
|  | EXTI line 11 | Input | Used for USART detection. Baudrate calculation is based on this line interrupt. |



**Table** **14.** **STM32C051xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1110110x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain pull-up mode. |
|  | I2C1_SDA pin |  | PB7 pin: data line is used in open-drain pull-up mode. |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1110110x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PB10 pin: clock line is used in open-drain pull-up mode. |
|  | I2C2_SDA pin |  | PB11 pin: data line is used in open-drain pull-up mode. |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Target mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: target data Input line, used in alternate function, pull down mode. |
|  | SPI1_MISO pin(1) | Output | PA6 pin: target data output line, used in alternate function, pull down mode |
|  | SPI1_SCK pin | Input | PA5 pin: target clock line, used in alternate function, pull down mode. |
|  | SPI1_NSS pin |  | PA4 pin: slave chip select pin used in alternate function, pull down mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PB15 pin: Slave data Input line, used in alternate function, pull down mode. |
|  | SPI2_MISO pin(1) | Output | PB14 pin: Slave data output line, used in alternate function, pull down mode |
|  | SPI2_SCK pin | Input | PB13 pin: Slave clock line, used in alternate function, pull down mode. |
|  | SPI2_NSS pin |  | PB12 pin: slave chip select pin used in alternate function, pull down mode. |

1. SPI Tx (MISO) is handled by DMA. On the bootloader start-up after SPI initialization as soon as the bit DMATx enable on SPI CR2 register is set to 0x1, the MISO line is set to 3.3 V.

### Boot model

The bootloader follows boot model V2 (see [Section 4.10](#_bookmark35)), there are no specific constraints.

### Bootloader selection

[Figure 15](#_bookmark60)* *shows the bootloader selection mechanism.

**Figure** **15.** **Bootloader** **V11.0** **selection** **for** **STM32C051xx** **devices**
































| Disable all other interfaces clocks |  |
| --- | --- |
|  |  |


| Disable all other interfaces clocks |  |
| --- | --- |
|  |  |





[Table 15](#_bookmark62)* *lists the STM32C051xx devices bootloader versions.

**Table** **15.** **STM32C051xx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V11.0 | Initial bootloader version | Empty check flag cleared by error on the bootloader startup phase Root cause: on the startup phase the bootloader SW performs a system deinitialization, leading to write the default value on the FLASH_ACR register, which overrides the Empty check bit with 0 Behavior: when Empty check boot mode is used and the flash memory is empty, the MCU boots on the bootloader but the flag is cleared by the SW. If a reset is triggered, the system tries to boot on the empty flash memory, and crashes. Caution: Avoid using reset on this case. if the system crashes, an option byte change or POR is needed to reboot. |




## STM32C071xx devices


### Bootloader configuration

The STM32C071xx bootloader is activated by applying Pattern 11 (see [Table 2](#_bookmark7)). [Table 14](#_bookmark56)
shows the hardware resources used by this bootloader.

**Table** **16.** **STM32C071xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 24 MHz (no PLL) |
|  |  | HSI48 enabled | The clock recovery system (CRS) is enabled for the DFU bootloader so that USB can be clocked by HSI48 48 MHz |
|  | RAM | - | 8.75 Kbytes, starting from address 0x20000000, are used by the bootloader firmware. |
|  | System memory | - | 28 Kbytes, starting from address 0x1FFF0000, contain the bootloader firmware. |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset if the hardware IWDG option was previously enabled by the user. |
| Securable memory area | - | - | The address to jump to for the securable memory area is 0x1FFF1600 |
| USART1 | USART1 | Enabled | Once initialized, the USART1 configuration is 8 bits, even parity, and one stop bit. |
|  | USART1_RX pin | Input | PA10 pin(1): USART1 in reception mode. Used in input pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin(1): USART1 in transmission mode. Set as input until USART1 is detected. |
| USART2 | USART2 | Enabled | Once initialized, the USART2 configuration is 8 bits, even parity, and one stop bit. |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Set as input until USART2 is detected. |
|  | EXTI line 3 | Input | Used for USART detection. Baudrate calculation is based on this line interrupt. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1110001x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain pull-up mode. |
|  | I2C1_SDA pin |  | PB7 pin: data line is used in open-drain pull-up mode. |



**Table** **16.** **STM32C071xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1110001x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PB10 pin: clock line is used in open-drain pull-up mode. |
|  | I2C2_SDA pin |  | PB11 pin: data line is used in open-drain pull-up mode. |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Target mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: target data Input line, used in push-pull, pull down mode. |
|  | SPI1_MISO pin(2) | Output | PA6 pin: target data output line, used in push-pull, pull down mode |
|  | SPI1_SCK pin | Input | PA5 pin: target clock line, used in push-pull, pull down mode. |
|  | SPI1_NSS pin |  | PA4 pin: slave chip select pin used in push-pull, pull down mode. |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PB15 pin: Slave data Input line, used in push-pull, pull down mode. |
|  | SPI2_MISO pin(2) | Output | PB14 pin: Slave data output line, used in push-pull, pull down mode |
|  | SPI2_SCK pin | Input | PB13 pin: Slave clock line, used in push-pull, pull down mode. |
|  | SPI2_NSS pin |  | PB12 pin: slave chip select pin used in push-pull, pull down mode. |
| DFU | USB | Enabled | USB FS configured in forced device mode. USB FS interrupt vector is enabled and used for USB DFU communications. |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in alternate push-pull, no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in alternate push-pull, no pull mode. No external pull-up resistor is required. |




1. Differently from other STM32C0 products, USART1 is not remapped to PA11/PA12 on small packages, as these pins are used for the USB.
1. SPI Tx (MISO) is handled by DMA. On the bootloader start-up after SPI initialization as soon as the bit DMATx enable on SPI CR2 register is set to 0x1, the MISO line is set to 3.3 V.

### Bootloader selection

[Figure 15](#_bookmark60)* *shows the bootloader selection mechanism.

**Figure** **16.** **Bootloader** **V13.1** **selection** **for** **STM32C071xx** **devices**














### Bootloader version

[Table 15](#_bookmark62)* *lists the STM32C071xx devices bootloader versions.


**Table** **17.** **STM32C071xx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V13.1 | Initial bootloader version | Empty check flag cleared by error on the startup phase Root cause: during startup the bootloader SW performs a system deinitialization, leading to write the default value on the FLASH_ACR register, which overrides the Empty check bit with 0 Behavior: when Empty check boot mode is used and the flash memory is empty, the MCU boots on the bootloader but the flag is cleared by the SW. If a reset is triggered, the system tries to boot on the empty flash memory, and crashes. Avoid using reset on this case. if the system crashes, an option byte change or POR is needed to reboot. |


## STM32C091xx/92xx devices


### Bootloader configuration

The STM32C091xx/92xx bootloader is activated by applying Pattern 11 (see [Table 2](#_bookmark7)). [Table 14](#_bookmark56)* *shows the hardware resources used by this bootloader.

**Table** **18.** **STM32C091xx/92xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 24 MHz, derived directly from the HSI |
|  | RAM | - | 5 Kbytes, starting from address 0x2000 0000, are used by the bootloader firmware. |
|  | System memory | - | 12 Kbytes, starting from address 0x1FFF 0000, contain the bootloader firmware. |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset if the hardware IWDG option was previously enabled by the user. |
| Securable memory area | - | - | The address to jump to for the securable memory area is 0x1FFF 3E00 |
| USART1 | USART1 | Enabled | Once initialized, the USART1 configuration is 8 bits, even parity, and one stop bit. |
|  | USART1_RX pin | Input | PA10 pin: USART in reception mode. PA12 pin: as PA10 pin does not exist on TSSOP20, WLCSP24, and UFQFN28, PA12 is remapped to PA10. Used in alternate function with pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART in transmission mode. PA11 pin: as PA9 pin does not exist on TSSOP20, WLCSP24, and UFQFN28, PA11 is remapped to PA9. Kept in reset configuration until 0x7F detected on USART_RX. |
| USART2 | USART2 | Enabled | Once initialized, the USART2 configuration is 8 bits, even parity, and one stop bit. |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in alternate function, pull-up mode |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Kept in reset configuration until 0x7F detected on USART_RX |
|  | EXTI line 3 | Input | Used for USART detection. Baudrate calculation is based on this line interrupt. |



**Table** **18.** **STM32C091xx/92xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| USART3 | USART3 | Enabled | Once initialized the USART3 configuration is: 8- bits, even parity and 1 Stop bit |
|  | USART3_RX pin | Input | PC11 pin: USART in reception mode. Used in alternate function with pull-up mode |
|  | USART3_TX pin | Output | PC10 pin: USART in transmission mode. Kept in reset configuration until 0x7F detected on USART_RX |
|  | EXTI line 11 | Input | Used for USART detection. Baudrate calculation is based on this line interrupt |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1110111x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain pull-up mode. |
|  | I2C1_SDA pin |  | PB7 pin: data line is used in open-drain pull-up mode. |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1110111x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PB10 pin: clock line is used in open-drain pull-up mode. |
|  | I2C2_SDA pin |  | PB11 pin: data line is used in open-drain pull-up mode. |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Target mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: target data Input line, used in alternate function, pull down mode. |
|  | SPI1_MISO pin(1) | Output | PA6 pin: target data output line, used in alternate function, pull down mode |
|  | SPI1_SCK pin | Input | PA5 pin: target clock line, used in alternate function, pull down mode. |
|  | SPI1_NSS pin |  | PA4 pin: slave chip select pin used in alternate function, pull down mode. |



**Table** **18.** **STM32C091xx/92xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PB15 pin: Slave data Input line, used in alternate function, pull down mode. |
|  | SPI2_MISO pin(1) | Output | PB14 pin: Slave data output line, used in alternate function, pull down mode |
|  | SPI2_SCK pin | Input | PB13 pin: Slave clock line, used in alternate function, pull down mode. |
|  | SPI2_NSS pin |  | PB12 pin: slave chip select pin used in alternate function, pull down mode. |
| FDCAN1 | FDCAN | Enabled(2) | Once initialized the FDCAN configuration is: Connection bit rate 250 kbit/s Data bit rate 1000 kbit/s FrameFormat = FDCAN_FRAME_FD_BRS Mode = FDCAN_MODE_NORMAL AutoRetransmission = ENABLE TransmitPause = DISABLE ProtocolException = ENABLE |
|  | FDCAN_Rx pin | Input | FDCAN in reception mode. Used in alternate function with pull up mode. PB0 for WLCSP24, UFQFN28, UFQFN32, and LQFP32 PD0 for UFQFN48, LQFP48, UFBGA64, and LQFP644 |
|  | FDCAN_Tx pin | Output | FDCAN in transmission mode. Used in alternate function with pull up mode PB1 for WLCSP24, UFQFN28, UFQFN32, and LQFP32 PD1 for UFQFN48, LQFP48, UFBGA64, and LQFP64 |

1. SPI Tx (MISO) is handled by DMA. On the bootloader start-up after SPI initialization, as soon as the bit DMATx enable on SPI CR2 register is set to 0x1, the MISO line is set to 3.3 V.
1. Only when enabled by engineering bytes. Not supported on TSSOP20 package, even if enabled by engineering bytes.

### Boot model

The bootloader follows boot model V2 (see [Section 4.10](#_bookmark35)), there are no specific constraints.

### Bootloader selection

[Figure 15](#_bookmark60)* *shows the bootloader selection mechanism.

**Figure** **17.** **Bootloader** **V18.1** **selection** **for** **STM32C091xx/92xx** **devices**

### Bootloader version

[Table 15](#_bookmark62)* *lists the STM32C091xx/92xx devices bootloader versions.

**Table** **19.** **STM32C091xx/92xx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V18.1 | Initial bootloader version | Empty check flag cleared by error on the bootloader startup phase Root cause: on the startup phase the bootloader SW performs a system deinitialization, leading to write the default value on the FLASH_ACR register, which overrides the Empty check bit with 0 Behavior: when Empty check boot mode is used and the flash memory is empty, the MCU boots on the bootloader but the flag is cleared by the SW. If a reset is triggered, the system tries to boot on the empty flash memory, and crashes. Caution: Avoid using reset on this case. if the system crashes, an option byte change or POR is needed to reboot. |





### Bootloader configuration

The STM32C531xx/532xx/542xx bootloader is activated by applying Pattern19 (see
[Table 2](#_bookmark7)). [Table 20](#_bookmark83)* *shows the hardware resources used by this bootloader.
The bootloader follows boot model V1 (see [Section 4.10](#_bookmark35)), so it inherits all its constraints.

**Table** **20.** **STM32C531xx/532xx/542xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is derived from HSI which is 144 MHz divided by 3. So, 48 MHz (no PLL). |
|  |  |  | Clock derived from HSI divided by 3 to have 48 MHz. The clock recovery system (CRS) is enabled for the DFU bootloader. |
|  |  | HSE enabled | Enabled only when FDCAN is enabled on the ENGI and option bytes. Quartz value is detected using TIM17. Only values 12, 24, and 48 MHz are supported as source clock of the FDCAN. If no HSE detected or value do match the supported values, HSE is disabled and FDCAN clock is HSI/3. |
|  | RAM | - | 15 Kbytes, starting from address 0x20000000 are used by the bootloader firmware. |
|  | System memory | - | 33 Kbytes, starting from address 0x0BF80080 contain the bootloader firmware. |
|  | IWDG | - | The independent watchdog (IWDG) prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (in case the hardware IWDG option was previously enabled by the user). |
| Securable memory area | - | - | The address to jump to for the securable memory area is 0x0BF88400. |
| USART1 | USART1 | Enabled | Once initialized, the USART1 configuration is: 8 bits, even parity and 1 Stop bit. |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Kept in reset configuration until 0x7F detected on USART_RX. |



**Table** **20.** **STM32C531xx/532xx/542xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| USART2 | USART2 | Enabled | Once initialized, the USART2 configuration is: 8 bits, even parity and 1 Stop bit. |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: in all packages except TSSOP20, QFN20, and QFN24. PB0 pin: in TSSOP20, QFN20, and QFN24 packages USART2 in transmission mode. Kept in reset configuration until 0x7F detected on USART_RX. |
| UART4 | UART4 | Enabled | Once initialized, the UART4 configuration is: 8 bits, even parity and 1 Stop bit. |
|  | UART4_RX pin | Input | PA1 pin: UART4 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | UART4_TX pin | Output | PA0 pin: UART4 in transmission mode. Kept in reset configuration until 0x7F detected on USART_RX. |
| FDCAN2 | FDCAN2 | Enabled | Once initialized, the FDCAN2 configuration is: Connection bit rate 250 kbit/s Data bit rate 1000 kbit/s FrameFormat = FDCAN_FRAME_FD_BRS Mode = FDCAN_MODE_NORMAL AutoRetransmission = ENABLE TransmitPause = DISABLE ProtocolException = ENABLE |
|  | FDCAN2_RX pin | Input | PB5 pin: FDCAN2 in reception mode. Used in alternate push-pull, no pull mode. |
|  | FDCAN2_TX pin | Output | PB6 pin: FDCAN2 in transmission mode. Used in alternate push-pull, no pull mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI1 | SPI1_MOSI pin | Input | PA7 pin: Slave data Input line, used in push-pull, pull-down mode. |
|  | SPI1_MISO pin(1) | Output | PA6 pin: used in all packages except TSSOP20, QFN20, and QFN24. PB4 pin used for packages TSSOP20, QFN20, and QFN24. Slave data output line, used in push-pull, pull-down mode. |
|  | SPI1_SCK pin | Input | PA5 pin: used in all packages except TSSOP20, QFN20, and QFN24. PB3 pin: used in packages TSSOP20, QFN20, and QFN24. Slave clock line, used in push-pull, pull-down mode. |
|  | SPI1_NSS pin | Input | PA4 pin: used in all packages except TSSOP20, QFN20, and QFN24. PA15 pin: used in packages TSSOP20, QFN20, and QFN24. Slave chip select pin used in push-pull, pull-down mode. |
| SPI2 | SPI2_MOSI pin | Input | PB15 pin: Slave data Input line, used in push-pull, pull-down mode. |
|  | SPI2_MISO pin(1) | Output | PB14 pin: Slave data output line, used in push-pull, pull-down mode |
|  | SPI2_SCK pin | Input | PB13 pin: Slave clock line, used in push-pull, pull-down mode. |
|  | SPI2_NSS pin | Input | PB12 pin: slave chip select pin used in push-pull, pull-down mode. |
| DFU | USB | Enabled | USB FS configured in forced device mode. USB FS interrupt vector is enabled and used for USB DFU communications. |
|  | USB_DM pin | Input/Output | PA11 pin: Not configured by bootloader SW. |
|  | USB_DP pin |  | PA12 pin: Not configured by bootloader SW. |

1. SPI Tx (MISO) is handled by DMA. On the bootloader start-up after SPI initialization as soon as the bit DMATx enable on SPI CR2 register is set to 0x1, the MISO line is set to 3.3 V.


**Table** **21.** **STM32C531xx/532xx/542xx** **special** **commands**
| Special commands supported (USART/SPI/FDCAN) Opcode – 0x50 |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Function | Sub-Opcode (2 bytes) | Number of data sent (2 bytes) | Data sent | Number of data received | Data received (2 bytes) | Number of status data received (2 bytes) | Status data received |
| Reset | 0x02 | 0x4 | 0x0 | 0x0 | NA | 0x1 | 0x0 |
| Erase EEPROM | 0xA4 | 0x4 | Page number to erase | 0x0 | NA | 0x1 | 0x0 |


*Note:**	USB** **special** **commands** **differ** **from** **other** **protocols** **due** **to** **USB** **protocol** **specificities:*
  - *No** **opcode** **is** **used;** **the** **sub-opcode** **is** **used** **directly.*
  - *The** **sub-opcode** **is** **treated** **as** **a** **single** **byte,** **not** **two** **bytes.*
  - *Data** **is** **sent** **on** **the** **USB** **frame** **byte** **by** **byte;** **there** **is** **no** **need** **to** **specify** **the** **number** of data bytes to be transmitted.*
  - *Returned** **data** **and** **status** **are** **formatted** **according** **to** **the** **native** **USB** **protocol.*


### Bootloader selection

[Figure 18](#_bookmark87)* *shows the bootloader selection mechanism.





### Bootloader version

[Table 22](#_bookmark89)* *lists the STM32C531xx/532xx/542xx devices bootloader versions.

**Table** **22.** **STM32C531xx/532xx/542xx** **bootloader** **versions**
| Bootloader version number | Description | Known limitations |
| --- | --- | --- |
| V16.0 | Initial bootloader version | None |


### STM32C55xxx/562xx devices


### Bootloader configuration

The STM32C55xxx/562xx bootloader is activated by applying Pattern19 (see [Table 2](#_bookmark7)). [Table 23](#_bookmark92)* *shows the hardware resources used by this bootloader.
The bootloader follows boot model V1 (see [Section 4.10](#_bookmark35)), so it inherits all its constraints.

**Table** **23.** **STM32C55xxx/562xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is derived from HSI which is 144 MHz divided by 3. So, 48 MHz (no PLL). |
|  |  |  | Clock derived from HSI divided by 3 to have 48 MHz. The clock recovery system (CRS) is enabled for the DFU bootloader. |
|  |  | HSE enabled | Enabled only when FDCAN is enabled on the ENGI and option bytes. Quartz value is detected using TIM17. Only values 12, 24, and 48 MHz are supported as source clock of the FDCAN. If no HSE detected or value do match the supported values, HSE is disabled and FDCAN clock is HSI/3. |
|  | RAM | - | 15 Kbytes, starting from address 0x20000000 are used by the bootloader firmware. |
|  | System memory | - | 33 Kbytes, starting from address 0x0BF80080 contain the bootloader firmware. |
|  | IWDG | - | The independent watchdog (IWDG) prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (in case the hardware IWDG option was previously enabled by the user). |
| Securable memory area | - | - | The address to jump to for the securable memory area is 0x0BF88400. |
| USART1 | USART1 | Enabled | Once initialized, the USART1 configuration is: 8 bits, even parity and 1 Stop bit. |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Kept in reset configuration until 0x7F detected on USART_RX. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| USART2 | USART2 | Enabled | Once initialized, the USART2 configuration is: 8 bits, even parity and 1 Stop bit. |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Kept in reset configuration until 0x7F detected on USART_RX. |
| USART3 | USART3 | Enabled | Once initialized, the USART3 configuration is: 8 bits, even parity and 1 Stop bit. |
|  | USART3_RX pin | Input | PD9 pin: USART3 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART3_TX pin | Output | PD8 pin:USART3 in transmission mode. Kept in reset configuration until 0x7F detected on USART_RX. |
| UART4 | UART4 | Enabled | Once initialized, the UART4 configuration is: 8 bits, even parity and 1 Stop bit. |
|  | UART4_RX pin | Input | PA1 pin: UART4 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | UART4_TX pin | Output | PA0 pin: UART4 in transmission mode. Kept in reset configuration until 0x7F detected on USART_RX. |
| FDCAN1 | FDCAN1 | Enabled | Once initialized, the FDCAN1 configuration is: Connection bit rate 250 kbit/s Data bit rate 1000 kbit/s FrameFormat = FDCAN_FRAME_FD_BRS Mode = FDCAN_MODE_NORMAL AutoRetransmission = ENABLE TransmitPause = DISABLE ProtocolException = ENABLE |
|  | FDCAN1_RX pin | Input | PB5 pin: FDCAN1 in reception mode. Used in alternate push-pull, no pull mode. |
|  | FDCAN1_TX pin | Output | PB6 pin: FDCAN1 in transmission mode. Used in alternate push-pull, no pull mode. |
| SPI1 | SPI1_MOSI pin | Input | PA7 pin: Slave data Input line, used in push-pull, pull-down mode. |
|  | SPI1_MISO pin(1) | Output | PA6 pin: Slave data output line, used in push-pull, pull-down mode. |
|  | SPI1_SCK pin | Input | PA5 pin: Slave clock line, used in push-pull, pull-down mode. |
|  | SPI1_NSS pin | Input | PA4 pin: Slave chip select pin used in push-pull, pull-down mode. |



**Table** **23.** **STM32C55xxx/562xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI2 | SPI2_MOSI pin | Input | PB15 pin: Slave data Input line, used in push-pull, pull-down mode. |
|  | SPI2_MISO pin(1) | Output | PB14 pin: Slave data output line, used in push-pull, pull-down mode |
|  | SPI2_SCK pin | Input | PB13 pin: Slave clock line, used in push-pull, pull-down mode. |
|  | SPI2_NSS pin | Input | PB12 pin: slave chip select pin used in push-pull, pull-down mode. |
| SPI3 | SPI3_MOSI pin | Input | PB2 pin: Slave data Input line, used in push-pull, pull-down mode. |
|  | SPI3_MISO pin(1) | Output | PB0 pin: Slave data output line, used in push-pull, pull-down mode |
|  | SPI3_SCK pin | Input | PB1 pin: Slave clock line, used in push-pull, pull-down mode. |
|  | SPI3_NSS pin | Input | PB8 pin: slave chip select pin used in push-pull, pull-down mode. |
| DFU | USB | Enabled | USB FS configured in forced device mode. USB FS interrupt vector is enabled and used for USB DFU communications. |
|  | USB_DM pin | Input/Output | PA11 pin: Not configured by bootloader SW. |
|  | USB_DP pin |  | PA12 pin: Not configured by bootloader SW. |

1. SPI Tx (MISO) is handled by DMA. On the bootloader start-up after SPI initialization as soon as the bit DMATx enable on SPI CR2 register is set to 0x1, the MISO line is set to 3.3 V.

**Table** **24.** **STM32C55xxx/562xx** **special** **commands**
| Special commands supported (USART/SPI/FDCAN) Opcode – 0x50 |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Function | Sub-Opcode (2 bytes) | Number of data sent (2 bytes) | Data sent | Number of data received | Data received (2 bytes) | Number of status data received (2 bytes) | Status data received |
| Reset | 0x02 | 0x4 | 0x0 | 0x0 | NA | 0x1 | 0x0 |
| Erase EEPROM | 0xA4 | 0x4 | Page number to erase | 0x0 | NA | 0x1 | 0x0 |


*Note:**	USB** **special** **commands** **differ** **from** **other** **protocols** **due** **to** **USB** **protocol** **specificities:*
  - *No** **opcode** **is** **used;** **the** **sub-opcode** **is** **used** **directly.*
  - *The** **sub-opcode** **is** **treated** **as** **a** **single** **byte,** **not** **two** **bytes.*
  - *Data** **is** **sent** **on** **the** **USB** **frame** **byte** **by** **byte;** **there** **is** **no** **need** **to** **specify** **the** **number** of data bytes to be transmitted.*
  - *Returned** **data** **and** **status** **are** **formatted** **according** **to** **the** **native** **USB** **protocol.*




[Figure 19](#_bookmark95)* *shows the bootloader selection mechanism.

**Figure** **19.** **Bootloader** **V16.x** **selection** **for** **STM32C55xxx/562xx** **devices**

### Bootloader version

[Table 22](#_bookmark89)* *lists the STM32C55xxx/562xx devices bootloader versions.

**Table** **25.** **STM32C55xxx/562xx** **bootloader** **versions**
| Bootloader version number | Description | Known limitations |
| --- | --- | --- |
| V16.1 | Initial bootloader version | None |


### STM32C5A3xx/59xxx devices


### Bootloader configuration

The STM32C5A3xx/59xxx bootloader is activated by applying Pattern19 (see [Table 2](#_bookmark7)). [Table 26](#_bookmark100)* *shows the hardware resources used by this bootloader.
The bootloader follows boot model V1 (see [Section 4.10](#_bookmark35)), so it inherits all its constraints.

**Table** **26.** **STM32C5A3xx/59xxx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is derived from HSI which is 144 MHz divided by 3. So, 48 MHz (no PLL). |
|  |  |  | Clock derived from HSI divided by 3 to have 48 MHz. The clock recovery system (CRS) is enabled for the DFU bootloader. |
|  |  | HSE enabled | Enabled only when FDCAN is enabled on the ENGI and option bytes. Quartz value is detected using TIM17. Only values 12, 24, and 48 MHz are supported as source clock of the FDCAN. If no HSE detected or value do match the supported values, HSE is disabled and FDCAN clock is HSI/3. |
|  | RAM | - | 15 Kbytes, starting from address 0x20000000 are used by the bootloader firmware. |
|  | System memory | - | 33 Kbytes, starting from address 0x0BF80080 contain the bootloader firmware. |
|  | IWDG | - | The independent watchdog (IWDG) prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (in case the hardware IWDG option was previously enabled by the user). |
| Securable memory area | - | - | The address to jump to for the securable memory area is 0x0BF88400. |
| USART1 | USART1 | Enabled | Once initialized, the USART1 configuration is: 8 bits, even parity and 1 Stop bit. |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Kept in reset configuration until 0x7F detected on USART_RX. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| USART2 | USART2 | Enabled | Once initialized, the USART2 configuration is: 8 bits, even parity and 1 Stop bit. |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Kept in reset configuration until 0x7F detected on USART_RX. |
| USART3 | USART3 | Enabled | Once initialized, the USART3 configuration is: 8 bits, even parity and 1 Stop bit. |
|  | USART3_RX pin | Input | PD9 pin: USART3 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART3_TX pin | Output | PD8 pin:USART3 in transmission mode. Kept in reset configuration until 0x7F detected on USART_RX. |
| UART4 | UART4 | Enabled | Once initialized, the UART4 configuration is: 8 bits, even parity and 1 Stop bit. |
|  | UART4_RX pin | Input | PA1 pin: UART4 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | UART4_TX pin | Output | PA0 pin: UART4 in transmission mode. Kept in reset configuration until 0x7F detected on USART_RX. |
| FDCAN2 | FDCAN2 | Enabled | Once initialized, the FDCAN2 configuration is: Connection bit rate 250 kbit/s Data bit rate 1000 kbit/s FrameFormat = FDCAN_FRAME_FD_BRS Mode = FDCAN_MODE_NORMAL AutoRetransmission = ENABLE TransmitPause = DISABLE ProtocolException = ENABLE |
|  | FDCAN2_RX pin | Input | PB5 pin: FDCAN2 in reception mode. Used in alternate push-pull, no pull mode. |
|  | FDCAN2_TX pin | Output | PB6 pin: FDCAN2 in transmission mode. Used in alternate push-pull, no pull mode. |
| SPI1 | SPI1_MOSI pin | Input | PA7 pin: Slave data Input line, used in push-pull, pull-down mode. |
|  | SPI1_MISO pin(1) | Output | PA6 pin: Slave data output line, used in push-pull, pull-down mode. |
|  | SPI1_SCK pin | Input | PA5 pin: Slave clock line, used in push-pull, pull-down mode. |
|  | SPI1_NSS pin | Input | PA4 pin: Slave chip select pin used in push-pull, pull-down mode. |



**Table** **26.** **STM32C5A3xx/59xxx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI2 | SPI2_MOSI pin | Input | PB15 pin: Slave data Input line, used in push-pull, pull-down mode. |
|  | SPI2_MISO pin(1) | Output | PB14 pin: Slave data output line, used in push-pull, pull-down mode |
|  | SPI2_SCK pin | Input | PB13 pin: Slave clock line, used in push-pull, pull-down mode. |
|  | SPI2_NSS pin | Input | PB12 pin: slave chip select pin used in push-pull, pull-down mode. |
| SPI3 | SPI3_MOSI pin | Input | PB2 pin: Slave data Input line, used in push-pull, pull-down mode. |
|  | SPI3_MISO pin(1) | Output | PB0 pin: Slave data output line, used in push-pull, pull-down mode |
|  | SPI3_SCK pin | Input | PB1 pin: Slave clock line, used in push-pull, pull-down mode. |
|  | SPI3_NSS pin | Input | PB8 pin: slave chip select pin used in push-pull, pull-down mode. |
| DFU | USB | Enabled | USB FS configured in forced device mode. USB FS interrupt vector is enabled and used for USB DFU communications. |
|  | USB_DM pin | Input/Output | PA11 pin: Not configured by bootloader SW. |
|  | USB_DP pin |  | PA12 pin: Not configured by bootloader SW. |

1. SPI Tx (MISO) is handled by DMA. On the bootloader start-up after SPI initialization as soon as the bit DMATx enable on SPI CR2 register is set to 0x1, the MISO line is set to 3.3 V.

**Table** **27.** **STM32C5A3xx/59xxx** **special** **commands**
| Special commands supported (USART/SPI/FDCAN) Opcode – 0x50 |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Function | Sub-Opcode (2 bytes) | Number of data sent (2 bytes) | Data sent | Number of data received | Data received (2 bytes) | Number of status data received (2 bytes) | Status data received |
| Reset | 0x02 | 0x4 | 0x0 | 0x0 | NA | 0x1 | 0x0 |
| Erase EEPROM | 0xA4 | 0x4 | Page number to erase | 0x0 | NA | 0x1 | 0x0 |


*Note:**	USB** **special** **commands** **differ** **from** **other** **protocols** **due** **to** **USB** **protocol** **specificities:*
  - *No** **opcode** **is** **used;** **the** **sub-opcode** **is** **used** **directly.*
  - *The** **sub-opcode** **is** **treated** **as** **a** **single** **byte,** **not** **two** **bytes.*
  - *Data** **is** **sent** **on** **the** **USB** **frame** **byte** **by** **byte;** **there** **is** **no** **need** **to** **specify** **the** **number** of data bytes to be transmitted.*
  - *Returned** **data** **and** **status** **are** **formatted** **according** **to** **the** **native** **USB** **protocol.*




[Figure 19](#_bookmark95)* *shows the bootloader selection mechanism.

**Figure** **20.** **Bootloader** **V16.x** **selection** **for** **STM32C55xxx/562xx** **devices**

### Bootloader version

[Table 22](#_bookmark89)* *lists the STM32C55xxx/562xx devices bootloader versions.

**Table** **28.** **STM32C55xxx/562xx** **bootloader** **versions**
| Bootloader version number | Description | Known limitations |
| --- | --- | --- |
| V16.0 | Initial bootloader version | None |





### Bootloader configuration

The STM32F03xx4/6 bootloader is activated by applying Pattern 2 (see [Table 2](#_bookmark7)). [Table 29](#_bookmark108)
shows the hardware resources used by this bootloader.

**Table** **29.** **STM32F03xx4/6** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 24 MHz (using PLL clocked by HSI). 1 flash Wait State. |
|  | RAM | - | 2 Kbytes, starting from address 0x20000000, are used by the bootloader firmware. |
|  | System memory | - | 3 Kbytes, starting from address 0x1FFFEC00 contain the bootloader firmware. |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset if the hardware IWDG option was previously enabled by the user. |
| USART1 (on PA10/PA9) | USART1 | Enabled | Once initialized, the USART1 configuration is 8 bits, even parity, and one stop bit. |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in input pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART1 (on PA14/PA15) | USART1 | Enabled | Once initialized, the USART1 configuration is 8 bits, even parity, and one stop bit. |
|  | USART1_RX pin | Input | PA15 pin: USART1 in reception mode. Used in input pull-up mode. |
|  | USART1_TX pin | Output | PA14 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART1s | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host. |


The system clock is derived from the embedded internal high-speed RC. No external quartz is required for the bootloader execution.
*Note:**	After** **the** **STM32F03xx4/6** **device** **has** **booted** **in** **bootloader** **mode,** **serial** **wire** **debug** **(SWD)** communication is no longer possible until the system is reset. This is because the SWD uses the PA14 pin (SWCLK), already used by the bootloader (USART1_TX).*

### Bootloader selection

[Figure 21](#_bookmark110)* *shows the bootloader selection mechanism.

**Figure** **21.** **Bootloader** **selection** **for** **STM32F03xx4/6** **devices**

















| Disable all interrupt sources |  |
| --- | --- |
|  |  |


| Configure USARTx |  |
| --- | --- |
|  |  |







### Bootloader version

[Table 30](#_bookmark112)* *lists the STM32F03xx4/6 devices bootloader versions.

**Table** **30.** **STM32F03xx4/6** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V1.0 | Initial bootloader version | For the USART interface, two consecutive NACKs instead of one are sent when a Read Memory or Write Memory command is sent and the RDP level is active. |





### Bootloader configuration

The STM32F030xC bootloader is activated by applying Pattern 2 (see [Table 2](#_bookmark7)). [Table 31](#_bookmark115)
shows the hardware resources used by this bootloader.

**Table** **31.**	STM32F030xC** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 48 MHz with HSI 8 MHz as clock source. |
|  | RAM | - | 6 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 8 Kbytes, starting from address 0x1FFFD800, contain the bootloader firmware. |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in input pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART2 (on PA2/PA3) | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in input pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Used in input pull-up mode. |
| USART2 (on PA14/PA15) | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA15 pin: USART2 in reception mode. Used in input pull-up mode. |
|  | USART2_TX pin | Output | PA14 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1000001x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin |  | PB7 pin: data line is used in open-drain no pull mode. |



*Note:**	After** **the** **devices have** **booted** **in** **bootloader** **mode** **using** **USART2,** **the** **serial** **wire** **debug** (SWD)** **communication** **is** **no** **more** **possible** **until** **the** **system** **is** **reset,** **because** **SWD** **uses PA14 pin (SWCLK), already used by the bootloader (USART2_RX).*
The system clock is derived from the embedded internal high-speed RC. No external quartz is required for the bootloader execution.

### Bootloader selection

[Figure 22](#_bookmark117)* *shows the bootloader selection mechanism.

**Figure** **22.Bootloader** **selection** **for** **STM32F030xC**











| Disable all interrupt sources and other interfaces clock’s |  |
| --- | --- |
|  |  |


| Disable all interrupt sources and other interfaces clock’s |  |
| --- | --- |
|  |  |









### Bootloader version

[Table 32](#_bookmark119)* *lists the STM32F030xC devices bootloader versions.

**Table** **32.** **STM32F030xC** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V5.2 | Initial bootloader version | PA13 is set in input pull-up mode even if not used by the bootloader |





### Bootloader configuration

The STM32F05xxx and STM32F030x8 devices bootloader is activated by applying Pattern 2 (described in [Table 2](#_bookmark7)). [Table 33](#_bookmark122)* *shows the hardware resources used by this bootloader.

**Table** **33.** **STM32F05xxx** **and** **STM32F030x8** **devices** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 24 MHz (using PLL clocked by HSI). 1 flash Wait State. |
|  | RAM | - | 2 Kbytes, starting from address 0x20000000, are used by the bootloader firmware. |
|  | System memory | - | 3 Kbytes, starting from address 0x1FFFEC00, contain the bootloader firmware. |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset if the hardware IWDG option was previously enabled by the user. |
| USART1 | USART1 | Enabled | Once initialized, the USART1 configuration is 8 bits, even parity, and one stop bit. |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART2 | USART2 | Enabled | Once initialized, the USART2 configuration is 8 bits, even parity, and one stop bit. |
|  | USART2_RX pin | Input | PA15 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PA14 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host. |


The system clock is derived from the embedded internal high-speed RC. No external quartz is required for the bootloader execution.
*Note:**	After** **the** **STM32F05xxx** **and** **STM32F030x8** **devices** **have** **booted** **in** **bootloader** **mode,** **the** serial wire debug (SWD) communication is no more possible until the system is reset, because SWD uses PA14 pin (SWCLK), already used by the bootloader (USART2_TX).*

### Bootloader selection

[Figure 23](#_bookmark124)* *shows the bootloader selection mechanism.

**Figure** **23.** **Bootloader** **selection** **for** **STM32F05xxx** **and** **STM32F030x8** **devices**

















| Disable all interrupt sources |  |
| --- | --- |
|  |  |


| Configure USARTx |  |
| --- | --- |
|  |  |







### Bootloader version

[Table 34](#_bookmark126)* *lists the STM32F05xxx and STM32F030x8 devices bootloader versions.

**Table** **34.** **STM32F05xxx** **and** **STM32F030x8** **devices** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V2.1 | Initial bootloader version | At bootloader startup, the HSITRIM value is set to 0 (in HSITRIM bits on RCC_CR register) instead of default value (16), as a consequence a deviation is generated in crystal measurement. For better results, use the smallest supported crystal value (i.e. 4 MHz). For the USART interface, two consecutive NACKs instead of 1 NACK are sent when a Read Memory or Write Memory command is sent and the RDP level is active. PA13 is set in input pull-up mode even if not used by the Bootloader. |





### Bootloader configuration

The STM32F04xxx bootloader is activated by applying Pattern 6 (described in [Table 2](#_bookmark7)). [Table 35](#_bookmark129)* *shows the hardware resources used by this bootloader.

**Table** **35.** **STM32F04xxx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 48 MHz with HSI48 48 MHz as clock source. |
|  |  | - | The clock recovery system (CRS) is enabled for the DFU to allow USB to be clocked by HSI48 48 MHz. |
|  | RAM | - | 6 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 13 Kbytes, starting from address 0x1FFFC400, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in input pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA15 pin: USART2 in reception mode. Used in input pull-up mode. |
|  | USART2_TX pin | Output | PA14 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |
| I2C1 | I2C1 | Enabled | The I2C1configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b0111110x (x = 0 for write and x = 1 for read). |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin | Input/output | PB7 pin: data line is used in open-drain no pull mode. |



**Table** **35.** **STM32F04xxx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| DFU | USB | Enabled | USB used in FS mode |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in alternate push-pull, no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line No external pull-up resistor is required. Used in alternate push-pull, no pull mode. |


*Note:**	After** **the** **devices have** **booted** **in** **bootloader** **mode** **using** **USART2,** **the** **serial** **wire** **debug** (SWD)** **communication** **is** **no** **more** **possible** **until** **the** **system** **is** **reset,** **because** **SWD** **uses PA14 pin (SWCLK), already used by the bootloader (USART2_RX).*
The system clock is derived from the embedded internal high-speed RC. No external quartz is required for the bootloader execution.
*Note:**	Due to empty check mechanism present on these products, it is not possible to jump from** user code to system bootloader. Such jump goes back to user flash memory space. If the first four bytes of user flash (at 0x0800 0000) are empty at the moment of jump (that is, erase** **first** **sector** **before** **jump** **or** **execute** **code** **from** **SRAM** **while** **flash** **is** **empty),** **the** **system bootloader** **is** **executed** **when** **jumped** **to.** **To** **jump** **to** **the** **bootloader** **one** **of** **the** **following** **three conditions must be fulfilled*
- *First** **four** **bytes** **of** **UserFlash** **=** **0xFFFFFFFF*
- *Boot_SW** **=** **0*
- *PB8** **or** **PF11** **State** **=** **1*
*PB8 for packages LQFP32 and lower (except QFN32)** PF11** **for** **packages** **QFN32** **and** **higher** **(except** **LQFP32)*




[Figure 24](#_bookmark131)* *shows the bootloader selection mechanism.

**Figure** **24.** **Bootloader** **selection** **for** **STM32F04xxx**


















### Bootloader version

**Table** **36.** **STM32F04xxx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V10.0 | Initial bootloader version | At bootloader startup, the HSITRIM value is set to 0 (in HSITRIM bits on RCC_CR register) instead of default value (16), as a consequence a deviation is generated in crystal measurement. For better results, use the smallest supported crystal value (4 MHz). PA13 is set in input pull-up mode even if not used by the bootloader. USB bootloader fails on some machines using a high speed controller. The bootloader is detected. but then data transaction fails. Root causes: De-synchronization between USB controller and bootloader SW due to the controller high speed transactions. Controller high speed inter-packet delay seems not sufficient for the bootloader SW (based on interrupt routines) to serve all needed transactions (the delay needed by the BL is nearly 25 µs). Some servicing IT are missed. This results in a communication fail, causing Write command to fail. Workarounds: Add USB HUB between host and the MCU. This relaxes transactions inter-packet delay, and allows the BL SW to perform correctly the task. Use USB controller/host that increase inter-packet delay. On new designs, use DFU SW that fix the issue in user flash memory. |
| V10.1 | Add dynamic support of USART/USB interfaces on PA11/12 IOs for small packages |  |





### Bootloader configuration

The STM32F070x6 bootloader is activated by applying Pattern 6 (described in [Table 2](#_bookmark7)). [Table 37](#_bookmark136)* *shows the hardware resources used by this bootloader.

**Table** **37.** **STM32F070x6** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | At startup, the system clock frequency is configured to 48 MHz using the HSI. If an external clock (HSE) is not present, the system is kept clocked from the HSI. |
|  |  | HSE enabled | The external clock can be used for all bootloader interfaces and must have one of the following values: 24, 18, 16, 12, 8, 6, 4 MHz. The PLL is used to generate 48 MHz for USB and system clock. |
|  |  | - | The CSS interrupt is enabled for HSE. Any failure (or removal) of the external clock generates system reset. |
|  | RAM | - | 6 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 13 Kbytes, starting from address 0x1FFFC400, contain the bootloader firmware. |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA15 pin: USART2 in reception mode |
|  | USART2_TX pin | Output | PA14 pin: USART2 in transmission mode |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 400 kHz 7-bit address, Target mode Analog filter ON Target 7-bit address: 0b0111110x x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain mode. |
|  | I2C1_SDA pin |  | PB7 pin: data line is used in open-drain mode. |
| DFU | USB | Enabled | USB FS configured in forced device mode. USB FS interrupt vector is enabled and used for USB DFU communications. |
|  | USB_DM pin | Input/output | PA11 pin: USB FS DM line |
|  | USB_DP pin |  | PA12 pin: USB FS DP line. No external pull-up resistor is required. |



*Note:**	If** **HSI** **deviation** **exceeds** **1%** **the** **bootloader** **might** **not** **function** **correctly.*
*Note:**	After** **the** *STM32F070x6 *devices** **have** **booted** **in** **bootloader** **mode** **using** **USART2,** **the** **serial** wire debug (SWD) communication is no more possible until the system is reset, because SWD uses PA14 pin (SWCLK), already used by the bootloader (USART2_RX).*
The bootloader has two cases of operation depending on the presence of the external clock (HSE) at bootloader startup:
    - If HSE is present and has a value of 24, 18, 16, 12, 8, 6, or 4 MHz, the system clock is configured to 48 MHz with HSE as clock source. The DFU interface, USART1, USART2, and I2C1 are functional and can be used to communicate with the bootloader device.
    - If HSE is not present, the HSI is kept as default clock source and only USART1, USART2, and I2C1 are functional.
The external clock (HSE) must be kept if it is connected at bootloader startup, because it is used as system clock source.
*Note:**	Due** **to** **empty** **check** **mechanism** **present** **on** **this** **product,** **it** **is** **not** **possible** **to** **jump** **from** **user** code** **to** **system** **bootloader.** **Such** **jump** **results** **in a** **jump** **back** **to** **user** **flash** **space,** **but** **if** **the first four bytes of user flash (at 0x0800 0000) are empty at the moment of jump (i.e. erase first sector before jump or execute code from SRAM while flash is empty), then system bootloader is executed when jumped to.*




[Figure 25](#_bookmark138)* *shows the bootloader selection mechanism.

**Figure** **25.** **Bootloader** **selection** **for** **STM32F070x6**

































### Bootloader version

[Table 38](#_bookmark140)* *lists the STM32F070x6 devices bootloader versions.

**Table** **38.** **STM32F070x6** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V10.2 | Initial bootloader version | At bootloader startup, the HSITRIM value is set to 0 (in HSITRIM bits on RCC_CR register) instead of default value (16), as a consequence a deviation is generated in crystal measurement. For better results, use the smallest supported crystal value (4 MHz). USB bootloader fails on some machines using a high speed controller. The bootloader is detected. but then data transaction fails. Root causes: De-synchronization between USB controller and bootloader SW due to the controller high speed transactions. Controller high speed inter-packet delay seems not sufficient for the bootloader SW (based on interrupt routines) to serve all needed transactions (the delay needed by the BL is nearly 25 µs). Some servicing IT are missed. This results in a communication fail, causing Write command to fail. Workarounds: Add USB HUB between host and the MCU. This relaxes transactions inter-packet delay, and allows the BL SW to perform correctly the task. Use USB controller/host that increase inter-packet delay. On new designs, use DFU SW that fix the issue in user flash memory. |
| V10.3 | Clock configuration fixed to HSI 8 MHz |  |





### Bootloader configuration

The STM32F070xB bootloader is activated by applying Pattern 2 (described in [Table 2](#_bookmark7)). [Table 39](#_bookmark143)* *shows the hardware resources used by this bootloader.

**Table** **39.** **STM32F070xB** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | At startup, the system clock frequency is configured to 48 MHz using the HSI. If an external clock (HSE) is not present, the system is kept clocked from the HSI. |
|  |  | HSE enabled | The external clock can be used for all bootloader interfaces and must have one of the following values: 24, 18, 16, 12, 8, 6, 4 MHz. The PLL is used to generate 48 MHz for USB and system clock. |
|  |  | - | The clock security system (CSS) interrupt is enabled for HSE. Any failure (or removal) of the external clock generates a system reset. |
|  | RAM | - | 6 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 12 Kbytes, starting from address 0x1FFFC800, contain the bootloader firmware. |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in input pull-up mode |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA15 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PA14 pin: USART2 in transmission mode. Used in input pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b0111011x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin |  | PB7 pin: data line is used in open-drain no pull mode. |



**Table** **39.** **STM32F070xB** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| DFU | USB | Enabled | USB FS configured in forced device mode. USB FS interrupt vector is enabled and used for USB DFU communications. |
|  | USB_DM pin | Input/output | PA11 pin: USB FS DM line used in alternate push-pull, no pull mode. |
|  | USB_DP pin |  | PA12 pin: USB FS DP line used in alternate push-pull, no pull mode. No external pull-up resistor is required. |


*Note:**	If** **HSI** **deviation** **exceeds** **1%** **the** **bootloader** **might** **not** **function** **correctly.*
*Note:**	After** **the** **devices have** **booted** **in** **bootloader** **mode** **using** **USART2,** **the** **serial** **wire** **debug** (SWD)** **communication** **is** **no** **more** **possible** **until** **the** **system** **is** **reset,** **because** **SWD** **uses PA14 pin (SWCLK), already used by the bootloader (USART2_RX).*
The bootloader has two cases of operation depending on the presence of the external clock (HSE) at bootloader startup:
    - If HSE is present and has a value of 24, 18, 16, 12, 8, 6, or 4 MHz, the system clock is configured to 48 MHz with HSE as clock source. The DFU interface, USART1, USART2, and I2C1 are functional and can be used to communicate with the bootloader device.
    - If HSE is not present, the HSI is kept as default clock source and only USART1, USART2, and I2C1 are functional.
The external clock (HSE) must be kept if it is connected at bootloader startup, because it is used as system clock source.




[Figure 26](#_bookmark145)* *shows the bootloader selection mechanism.

**Figure** **26.Bootloader** **selection** **for** **STM32F070xB**

































### Bootloader version

[Table 40](#_bookmark147)* *lists the STM32F070xB devices bootloader versions.

**Table** **40.** **STM32F070xB** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V10.2 | Initial bootloader version | At bootloader startup, the HSITRIM value is set to 0 (in HSITRIM bits on RCC_CR register) instead of default value (16), as a consequence a deviation is generated in crystal measurement. For better results, use the smallest supported crystal value (4 MHz). PA13 is set in alternate push-pull mode even if not used by the bootloader. USB bootloader fails on some machines using a high speed controller. The bootloader is detected. but then data transaction fails. Root causes: De-synchronization between USB controller and bootloader SW due to the controller high speed transactions. Controller high speed inter-packet delay seems not sufficient for the bootloader SW (based on interrupt routines) to serve all needed transactions (the delay needed by the BL is nearly 25 µs). Some servicing IT are missed. This results in a communication fail, causing Write command to fail. Workarounds: Add USB HUB between host and the MCU. This relaxes transactions inter-packet delay, and allows the BL SW to perform correctly the task. Use USB controller/host that increase inter-packet delay. On new designs, use DFU SW that fix the issue in user flash memory. |
| V10.3 | Clock configuration fixed to HSI 8 MHz |  |





### Bootloader configuration

The STM32F071xx/072xx bootloader is activated by applying Pattern 2 (described in
[Table 2](#_bookmark7)). [Table 41](#_bookmark150)* *shows the hardware resources used by this bootloader.

**Table** **41.** **STM32F071xx/072xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 48 MHz with HSI48 48 MHz as clock source. |
|  |  | - | CRS is enabled for the DFU to allow USB to be clocked by HSI48 48 MHz. |
|  | RAM | - | 6 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 12 Kbytes, starting from address 0x1FFFC800, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in input pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA15 pin: USART2 in reception mode. Used in input pull-up mode |
|  | USART2_TX pin | Output | PA14 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 400 kHz 7-bit address, Target mode Analog filter ON Target 7-bit address: 0b0111011x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain pull-up mode. |
|  | I2C1_SDA pin |  | PB7 pin: data line is used in open-drain pull-up mode. |



**Table** **41.** **STM32F071xx/072xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| DFU | USB | Enabled | USB used in FS mode |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in alternate push-pull, no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line No external pull-up resistor is required. Used in alternate push-pull, no pull mode. |


*Note:**	After** **the** **devices have** **booted** **in** **bootloader** **mode** **using** **USART2,** **the** **serial** **wire** **debug** (SWD)** **communication** **is** **no** **more** **possible** **until** **the** **system** **is** **reset,** **because** **SWD** **uses PA14 pin (SWCLK), already used by the bootloader (USART2_RX).*
The system clock is derived from the embedded internal high-speed RC. No external quartz is required for the bootloader execution.




[Figure 27](#_bookmark152)* *shows the bootloader selection mechanism.

**Figure** **27.** **Bootloader** **selection** **for** **STM32F071xx/072xx**


























### Bootloader version

[Table 42](#_bookmark154)* *lists the STM32F071xx/072xx devices bootloader versions.


**Table** **42.** **STM32F071xx/072xx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V10.1 | Initial bootloader version | At bootloader startup, the HSITRIM value is set to (0) (in HSITRIM bits on RCC_CR register) instead of default value (16), as a consequence a deviation is generated in crystal measurement. For better results, use the smallest supported crystal value (4 MHz). PA13 set in alternate push-pull, pull-up mode even if not used by bootloader. USB bootloader fails on some machines using a high speed controller. The bootloader is detected. but then data transaction fails. Root causes: De-synchronization between USB controller and bootloader SW due to the controller high speed transactions. Controller high speed inter-packet delay seems not sufficient for the bootloader SW (based on interrupt routines) to serve all needed transactions (the delay needed by the BL is nearly 25 µs). Some servicing IT are missed. This results in a communication fail, causing Write command to fail. Workarounds: Add USB HUB between host and the MCU. This relaxes transactions inter-packet delay, and allows the BL SW to perform correctly the task. Use USB controller/host that increase inter-packet delay. On new designs, use DFU SW that fix the issue in user flash memory. |





### Bootloader configuration

The STM32F09xxx bootloader is activated by applying Pattern 6 (described in
[Table 2](#_bookmark7)).[Table 43](#_bookmark157)* *shows the hardware resources used by this bootloader.

**Table** **43.**	STM32F09xxx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 48 MHz with HSI48 48 MHz as clock source. |
|  | RAM | - | 6 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 8 Kbytes, starting from address 0x1FFFD800, contain the bootloader firmware. |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in input pull-up mode |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in input pull-up mode. |
|  |  |  | PA15 pin: USART2 in reception mode. Used in input pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. |
|  |  |  | PA14 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1000001x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin |  | PB7 pin: data line is used in open-drain no pull mode. |



*Note:**	After the devices have booted in bootloader mode using USART2, the serial wire debug** (SWD)** **communication** **is** **no** **longer** **possible** **until** **the** **system** **is** **reset,** **because** **SWD** **uses PA14 pin (SWCLK), already used by the bootloader (USART2_RX).*
The system clock is derived from the embedded internal high-speed RC. No external quartz is required for the bootloader execution.

### Bootloader selection

**Figure** **28.** **Bootloader** **selection** **for** **STM32F09xxx**











| Disable all interrupt sources and other interfaces clock’s |  |
| --- | --- |
|  |  |


| Disable all interrupt sources and other interfaces clock’s |  |
| --- | --- |
|  |  |









### Bootloader version

[Table 44](#_bookmark161)* *lists the STM32F09xxx devices bootloader versions.

**Table** **44.** **STM32F09xxx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V5.0 | Initial bootloader version | At bootloader startup, the HSITRIM value is set to 0 in HSITRIM bits on RCC_CR register instead of default value (16). As a consequence, a deviation is generated in crystal measurement. For better results, use the smallest supported crystal value (4 MHz). PA13 set in input pull-up mode even if not used by the bootloader. |





### Bootloader configuration

The STM32F10xxx bootloader is activated by applying Pattern 1 (described in [Table 2](#_bookmark7)). [Table 45](#_bookmark164)* *shows the hardware resources used by this bootloader.

**Table** **45.** **STM32F10xxx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 24 MHz using the PLL. |
|  | RAM | - | 512 byte starting from address 0x20000000, are used by the bootloader firmware. |
|  | System memory | - | 2 Kbytes, starting from address 0x1FFFF000 contain the bootloader firmware. |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value and is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| USART1 | USART1 | Enabled | Once initialized, the USART1 configuration is 8 bits, even parity, and one stop bit. |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in input no pull mode. |
|  | USART1_TX pin | Output push-pull | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host. |


The system clock is derived from the embedded internal high-speed RC. No external quartz is required for the bootloader execution.

### Bootloader selection

[Figure 29](#_bookmark166)* *shows the bootloader selection mechanism.

**Figure** **29.** **Bootloader** **selection** **for** **STM32F10xxx**

















| Disable all interrupt sources |  |
| --- | --- |
|  |  |


| Configure USARTx |  |
| --- | --- |
|  |  |







### Bootloader version

[Table 46](#_bookmark168)* *lists the STM32F10xxx devices bootloader versions:

**Table** **46.** **STM32F10xxx** **bootloader** **versions**
| Version number | Description |
| --- | --- |
| V2.0 | Initial bootloader version |
| V2.1 | Updated Go Command to initialize the main stack pointer Updated Go command to return NACK when jump address is in the Option byte area or System memory area Updated Get ID command to return the device ID on two bytes Update the bootloader version to V2.1 |
| V2.2 | Updated Read Memory, Write Memory and Go commands to deny access with a NACK response to the first 0x200 bytes of RAM used by the bootloader Updated Readout Unprotect command to initialize the whole RAM content to 0x0 before ROP disable operation |




*The** **bootloader** **version** **for** **the** **STM32F1xx** **applies** **only** **to** **the** **embedded** **device’s** bootloader version and not to its supported protocols.*




### Bootloader configuration

The STM32F105xx/107xx bootloader is activated by applying Pattern 1 (described in
[Table 2](#_bookmark7)). [Table 47](#_bookmark171)* *shows the hardware resources used by this bootloader.

**Table** **47.** **STM32F105xx/107xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 24 MHz using the PLL. This is used only for USARTx and during CAN2, USB detection for CAN and DFUs (once CAN or DFU is selected, the clock source is derived from the external crystal). |
|  |  | HSE enabled | The external clock is mandatory only for DFU and CAN bootloaders and it must provide one of the following frequencies: 8 MHz, 14.7456 MHz or 25 MHz. For CAN bootloader, the PLL is used only to generate 48 MHz when 14.7456 MHz is used as HSE. For DFU, the PLL is used to generate a 48 MHz system clock from all supported external clock frequencies. |
|  |  | - | The CSS interrupt is enabled for the CAN and DFUs. Any failure (or removal) of the external clock will generate system reset. |
|  | RAM | - | 4 Kbytes, starting from address 0x20000000, are used by the bootloader firmware. |
|  | System memory | - | 18 Kbytes, starting from address 0x1FFFB000 contain the bootloader firmware. |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value and is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| USART1 | USART1 | Enabled | Once initialized, the USART1 configuration is 8 bits, even parity, and one stop bit. |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in input no pull mode. |
|  | USART1_TX pin | Output push-pull | PA9 pin: USART1 in transmission mode. Used in input no pull mode. |
| USART2 | USART2 | Enabled | Once initialized, the USART2 configuration is 8 bits, even parity, and one stop bit. The USART2 uses its remapped pins. |
|  | USART2_RX pin | Input | PD6 pin: USART2 receive (remapped pin) |
|  | USART2_TX pin | Output push-pull | PD5 pin: USART2 transmit (remapped pin) |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx bootloader. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| CAN2 | CAN2 | Enabled | Once initialized, the CAN2 configuration is baudrate 125 kbps, 11-bit identifier. Note: CAN1 is clocked during the CAN bootloader execution because CAN1 manages the communication between CAN2 and SRAM. |
|  | CAN2_RX pin | Input | PB5 pin: CAN2 receives (remapped pin). Used in alternate push-pull, pull-up mode. |
|  | CAN2_TX pin | Output push-pull | PB6 pin: CAN2 transmits (remapped pin). Used in input no pull mode. |
| DFU | USB | Enabled | USB OTG FS configured in forced device mode |
|  | USB_VBUS pin | Input | PA9: Power supply voltage line |
|  | USB_DM pin | Input/output | PA11 pin: USB_DM line |
|  | USB_DP pin |  | PA12 pin: USB_DP line. No external pull-up resistor is required |

The system clock is derived from the embedded internal high-speed RC for USARTx bootloader. This internal clock is used also for DFU and CAN bootloaders, but only for the selection phase. An external clock (8, 14.7456, or 25 MHz) is required for DFU and CAN bootloader execution after the selection phase.

### Bootloader selection

[Figure 30](#_bookmark173)* *shows the bootloader selection mechanism.

**Figure** **30.** **Bootloader** **selection** **for** **STM32F105xx/107xx** **devices**














| Disable all interrupt sources |  |
| --- | --- |
|  |  |


### Bootloader version

[Table 48](#_bookmark175)* *lists the STM32F105xx/107xx devices bootloader versions:

**Table** **48.** **STM32F105xx/107xx** **bootloader** **versions**
| Version number | Description |
| --- | --- |
| V1.0 | Initial bootloader version |
| V2.0 | Bootloader detection mechanism updated to fix the issue when GPIOs of unused peripherals in this bootloader are connected to low level or left floating during the detection phase. For more details refer to Section 22.3.2. Vector table set to 0x1FFFB000 instead of 0x00000000 Go command updated (for all bootloaders): USART1, USART2, CAN2, GPIOA, GPIOB, GPIOD and SysTick peripheral registers are set to their default reset values DFU: USB pending interrupt cleared before executing the Leave DFU command DFU subprotocol version changed from V1.0 to V1.2 Bootloader version updated to V2.0 |
| V2.1 | Fixed PA9 excessive consumption described in Section 22.3.4. Get-Version command (defined in AN3155) corrected. It returns 0x22 instead of 0x20 in bootloader V2.0. Refer to Section 22.3.3 for more details. Bootloader version updated to V2.1 |
| V2.2 | Fixed DFU option bytes descriptor (set to ‘e’ instead of ‘g’ because it is read/write and not erasable). Fixed DFU polling timings for flash Read/Write/Erase operations. Robustness enhancements for DFU interface. Updated bootloader version to V2.2. |


*Note:**	The** **bootloader** **ID** **format** **is** **applied** **to** **all** **STM32** **devices** **except** **the** **STM32F1xx** **products.** The** **version** **for** **STM32F1xx** **applies** **only** **to** **the** **embedded** **device’s** **bootloader** **version** **and not to its supported protocols.*

#### How to identify STM32F105xx/107xx bootloader versions

Bootloader V1.0 is implemented on devices whose date code is lower than 937. Bootloader V2.0 and V2.1 are implemented on devices with a date code higher than or equal to 937. Bootloader V2.2 is implemented on devices with a date code higher than or equal to 227.
Refer to the datasheets to find the date code on the device marking) There are two ways to distinguish between bootloader versions:
      - When using the USART bootloader, the Get-Version command defined in AN3155 has been corrected in V2.1 version. It returns 0x22 instead of 0x20 as in bootloader V2.0.
      - The values of the vector table at the beginning of the bootloader code are different. The user software (or via JTAG/SWD) reads 0x1FFFE945 at address 0x1FFFB004 for bootloader V2.0 0x1FFFE9A1 for bootloader V2.1, and 0x1FFFE9C1 for bootloader V2.2.


The DFU version can be read through the bcdDevice field of the DFU Device Descriptor:
      - V2.1 in bootloader V2.1
      - V2.2 in bootloader V2.2.

#### Bootloader unavailability on STM32F105xx/STM32F107xx devices with date code lower than 937

##### Description

The bootloader cannot be used if the USART1_RX (PA10), USART2_RX (PD6, remapped), CAN2_Rx (PB5, remapped), OTG_FS_DM (PA11), and/or OTG_FS_DP (PA12) pin(s) are held low or left floating during the bootloader activation phase.
The bootloader cannot be connected through CAN2 (remapped), DFU (OTG FS in Device mode), USART1 or USART2 (remapped).
On 64-pin packages, the USART2_RX signal remapped PD6 pin is not available and it is internally grounded. In this case, the bootloader cannot be used at all.
##### Workaround

      - For 64-pin packages
None. The bootloader cannot be used.
      - For 100-pin packages
Depending on the used peripheral, the pins for the unused peripherals must be kept at a high level during the bootloader activation phase as described below:
        - If USART1 is used to connect to the bootloader, PD6 and PB5 must be kept at a high level.
        - If USART2 is used to connect to the bootloader, PA10, PB5, PA11, and PA12 must be kept at a high level.
        - If CAN2 is used to connect to the bootloader, PA10, PD6, PA11, and PA12 must be kept at a high level.
        - If DFU is used to connect to the bootloader, PA10, PB5, and PD6 must be kept at a high level.
*Note:**	This limitation applies only to STM32F105xx and STM32F107xx devices with a date code** lower** **than** **937.** **STM32F105xx** **and** **STM32F107xx** **devices** **with** **a** **date** **code** **higher** **or** **equal to 937 are not impacted. See STM32F105xx and STM32F107xx datasheets for where to find the date code on the device marking.*

#### USART bootloader Get-Version command returns 0x20 instead of 0x22

##### Description

In USART mode, the Get-Version command (defined in AN3155) returns 0x20 instead of 0x22. This limitation is present on bootloader versions V1.0 and V2.0, while it is fixed in bootloader version 2.1.
##### Workaround

None.


#### PA9 excessive power consumption when USB cable is plugged in bootloader V2.0

##### Description

When connecting a USB cable after booting from System-Memory mode, PA9 pin (connected to VBUS = 5 V) is also shared with USART TX pin, configured as alternate
push-pull and forced to 0 since the USART peripheral is not yet clocked. As a consequence,
a current higher than 25 mA is drained by PA9 I/O and may affect the I/O pad reliability.
This limitation is fixed in bootloader version 2.1 by configuring PA9 as alternate function push-pull when a correct 0x7F is received on RX pin and the USART is clocked. Otherwise, PA9 is configured as alternate input floating.
##### Workaround

None.




### Bootloader configuration

The STM32F10xxx XL-density bootloader is activated by applying Pattern 3 (described in
[Table 2](#_bookmark7)). [Table 49](#_bookmark183)* *shows the hardware resources used by this bootloader.

**Table** **49.** **STM32F10xxx** **XL-density** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 24 MHz using the PLL. |
|  | RAM | - | 2 Kbytes, starting from address 0x20000000, are used by the bootloader firmware. |
|  | System memory | - | 6 Kbytes, starting from address 0x1FFFE000 contain the bootloader firmware. |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value and is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| USART1 | USART1 | Enabled | Once initialized, the USART1 configuration is 8 bits, even parity, and one stop bit. |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in input pull-up mode. |
|  | USART1_TX pin | Output push-pull | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART2 | USART2 | Enabled | Once initialized, the USART2 configuration is 8 bits, even parity, and one stop bit. |
|  | USART2_RX pin | Input | PD6 pin: USART2 receives (remapped pins). Used in input pull-up mode. |
|  | USART2_TX pin | Output push-pull | PD5 pin: USART2 transmits (remapped pins). Used in alternate push-pull, pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host. |


The system clock is derived from the embedded internal high-speed RC. No external quartz is required for the bootloader execution.

### Bootloader selection

**Figure** **31.** **Bootloader** **selection** **for** **STM32F10xxx** **XL-density** **devices**

### Bootloader version

**Table** **50.** **STM32F10xxx** **XL-density** **bootloader** **versions**
| Version number | Description |
| --- | --- |
| V2.1 | Initial bootloader version |


*Note:**	The** **bootloader** **ID** **format** **is** **applied** **to** **all** **STM32** **devices** **families** **except** **the** **STM32F1xx** family. The bootloader version for the STM32F1xx applies only to the embedded device bootloader version and not to its supported protocols.*





Two bootloader versions are available on STM32F2xxxx devices:
    - V2.x supporting USART1 and USART3
This version is embedded in revisions A, Z, and B
    - V3.x supporting USART1, USART3, CAN2, and DFU (USB FS device) This version is embedded in all other revisions (Y, X, W, 1, V, 2, 3, and 4)

### Bootloader V2.x

#### Bootloader configuration

The STM32F2xxxx bootloader is activated by applying Pattern 1 (described in [Table 2](#_bookmark7)). [Table 51](#_bookmark191)* *shows the hardware resources used by this bootloader.

**Table** **51.** **STM32F2xxxx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 24 MHz. |
|  | RAM | - | 8 Kbytes, starting from address 0x20000000. |
|  | System memory | - | 29 Kbytes, starting from address 0x1FFF0000, contain the bootloader firmware. |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value and is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
|  | Power | - | Voltage range is set to [1.62 V, 2.1 V]. In this range internal flash write operations are allowed only in byte format (half-word, word, and double-word operations are not allowed). The voltage range can be configured in run time using bootloader commands. |
| USART1 | USART1 | Enabled | Once initialized, the USART1 configuration is 8 bits, even parity, and one stop bit. |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode |
| USART3 (on PC10/PC11) | USART3 | Enabled | Once initialized, the USART3 configuration is 8 bits, even parity, and one stop bit. |
|  | USART3_RX pin | Input | PC11 pin: USART3 in reception mode |
|  | USART3_TX pin | Output | PC10 pin: USART3 in transmission mode |



**Table** **51.** **STM32F2xxxx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| USART3 (on PB10/PB11) | USART3 | Enabled | Once initialized, the USART3 configuration is 8 bits, even parity, and one stop bit |
|  | USART3_RX pin | Input | PB11 pin: USART3 in reception mode |
|  | USART3_TX pin | Output | PB10 pin: USART3 in transmission mode |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host. |


The system clock is derived from the embedded internal high-speed RC. No external quartz is required for the bootloader code.

#### Bootloader selection

[Figure 32](#_bookmark193)* *shows the bootloader selection mechanism.

**Figure** **32.** **Bootloader** **V2.x** **selection** **for** **STM32F2xxxx** **devices**















| Disable all interrupt sources |  |
| --- | --- |
|  |  |


| Configure USARTx |  |
| --- | --- |
|  |  |





[Table 52](#_bookmark195)* *lists the STM32F2xxxx devices V2.x bootloader versions:

**Table** **52.** **STM32F2xxxx** **bootloader** **V2.x** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V2.0 | Initial bootloader version | When a Read Memory command or Write Memory command is issued with an unsupported memory address and a correct address checksum (i.e. address 0x6000 0000), the command is aborted by the bootloader device, but the NACK (0x1F) is not sent to the host. As a result, the next two bytes (the number of bytes to be read/written and its checksum) are considered as a new command and its checksum. For the CAN interface, the Write Unprotect command is not functional. Use Write Memory command and write directly to the option bytes in order to disable the write protection.(1) |

      1. If the “number of data - 1” (N-1) to be read/written is not equal to a valid command code (0x00, 0x01, 0x02, 0x11, 0x21, 0x31, 0x43, 0x44, 0x63, 0x73, 0x82 or 0x92), the limitation is not perceived from the host, as the command is NACK-ed anyway (as an unsupported new command).

### Bootloader V3.x

#### Bootloader configuration

The STM32F2xxxx bootloader is activated by applying Pattern 1 (described in [Table 2](#_bookmark7)). [Table 53](#_bookmark198)* *shows the hardware resources used by this bootloader.

**Table** **53.** **STM32F2xxxx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 24 MHz using the PLL. The HSI clock source is used at startup (interface detection phase) and when USARTx interfaces are selected (once CAN or DFU is selected, the clock source is derived from the external crystal). |
|  |  | HSE enabled | The system clock frequency is 60 MHz. The HSE clock source is used only when the CAN or the DFU (USB FS device) interfaces are selected. The external clock must provide a frequency multiple of 1 MHz and ranging from 4 MHz to 26 MHz. |
|  |  | - | The CSS interrupt is enabled for the CAN and DFUs. Any failure (or removal) of the external clock generates system reset. |
|  | RAM | - | 8 Kbytes, starting from address 0x20000000, are used by the bootloader firmware. |
|  | System memory | - | 29 Kbytes, starting from address 0x1FF00000 contain the bootloader firmware. |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
|  | Power | - | Voltage range is set to 1.62 V, 2.1 V. In this range internal flash write operations are allowed only in byte format (half-word, word, and double-word operations are not allowed). The voltage range can be configured in run time using bootloader commands. |
| USART1 | USART1 | Enabled | Once initialized, the USART1 configuration is 8 bits, even parity, and one stop bit. |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in input no pull mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in no pull mode. |
| USART3 (on PB10/PB11) | USART3 | Enabled | Once initialized, the USART3 configuration is 8 bits, even parity, and one stop bit. |
|  | USART3_RX pin | Input | PB11 pin: USART3 in reception mode. Used in pull-up mode |
|  | USART3_TX pin | Output | PB10 pin: USART3 in transmission mode. Used in pull-up mode |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| USART3 (on PC10/PC11) | USART3 | Enabled | Once initialized, the USART3 configuration is 8 bits, even parity, and one stop bit. |
|  | USART3_RX pin | Input | PC11 pin: USART3 in reception mode. Used in pull-up mode. |
|  | USART3_TX pin | Output | PC10 pin: USART3 in transmission mode. Used in pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |
| CAN2 | CAN2 | Enabled | Once initialized, the CAN2 configuration is: Baudrate 125 kbps, 11-bit identifier. Note: CAN1 is clocked during CAN2 bootloader execution because CAN1 manages the communication between CAN2 and SRAM. |
|  | CAN2_RX pin | Input | PB5 pin: CAN2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | CAN2_TX pin | Output | PB13 pin: CAN2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| DFU | USB | Enabled | USB OTG FS configured in forced device mode |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in input no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in inpt no pull mode. No external pull-up resistor is required |
| CAN2 and DFUs | TIM11 | Enabled | This timer is used to determine the value of the HSE. Once the HSE frequency is determined, the system clock is configured to 60 MHz using PLL and HSE. |


The system clock is derived from the embedded internal high-speed RC for USARTx. This internal clock is also used for CAN and DFU (USB FS device), but only for the selection phase. An external clock multiple of 1 MHz (between 4 and 26 MHz) is required for CAN and DFU execution after the selection phase.


#### Bootloader selection

[Figure 33](#_bookmark200)* *shows the bootloader selection mechanism.

**Figure** **33.** **Bootloader** **V3.x** **selection** **for** **STM32F2xxxx** **devices**



| Disable all interrupt sources |  |
| --- | --- |
|  |  |





[Table 54](#_bookmark202)* *lists the STM32F2xxxx devices V3.x bootloader versions:

**Table** **54.** **STM32F2xxxx** **bootloader** **V3.x** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V3.2 | Initial bootloader version | When a Read Memory command or Write Memory command is issued with an unsupported memory address and a correct address checksum (i.e. address 0x6000 0000), the command is aborted by the bootloader device, but the NACK (0x1F) is not sent to the host. As a result, the next two bytes (which are the number of bytes to be read/written and its checksum) are considered as a new command and its checksum(1). Option bytes, OTP and Device Feature descriptors (in DFU interface) are set to “g” instead of “e” (not erasable memory areas). |
| V3.3 | Fix V3.2 limitations. DFU interface robustness enhancement | For the USART interface, two consecutive NACKs (instead of 1 NACK) are sent when a Read Memory or Write Memory command is sent and the RDP level is active. For the CAN interface, the Write Unprotect command is not functional. Use Write Memory command and write directly to the option bytes in order to disable the write protection. |

      1. If the “number of data - 1” (N-1) to be read/written is not equal to a valid command code (0x00, 0x01, 0x02, 0x11, 0x21, 0x31, 0x43, 0x44, 0x63, 0x73, 0x82 or 0x92), the limitation is not perceived from the host, as the command is NACK-ed anyway (as an unsupported new command).




### Bootloader configuration

The STM32F301xx/302x4(6/8) bootloader is activated by applying Pattern 2 (described in
[Table 2](#_bookmark7)). [Table 55](#_bookmark205)* *shows the hardware resources used by this bootloader.
**Table** **55.** **STM32F301xx/302x4(6/8)** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 48 MHz with HSI48 48 MHz as clock source. |
|  |  | HSE enabled | The external clock can be used for all bootloader interfaces and must have one the following values: 24,18,16,12,9,8,6,4,3 MHz. The PLL is used to generate the USB48 MHz clock and the 48 MHz clock for the system clock. |
|  |  | - | The CSS interrupt is enabled for the DFU. Any failure (or removal) of the external clock generates system reset. |
|  | RAM | - | 6 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 8 Kbytes, starting from address 0x1FFFD800, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| DFU | USB | Enabled | USB used in FS mode |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in alternate push-pull, no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in alternate push-pull, no pull mode. An external pull-up resistor 1.5 KΩ must be connected to USB_DP pin. |


The bootloader has two cases of operation, depending upon the presence of the external clock (HSE) at bootloader startup:
    - If HSE is present and has a value of 24, 18, 16, 12, 9, 8, 6, 4, or 3 MHz, the system clock is configured to 48 MHz with HSE as clock source. The DFU interface, USART1 and USART2 are functional and can be used to communicate with the bootloader device.
    - If HSE is not present, the HSI is kept as default clock source, and only USART1 and USART2 are functional.
*The** **external** **clock** **(HSE)** **must** **be** **kept** **if** **it** **is** **connected** **at** **bootloader** **startup,** **because** **it** **is** used as system clock source.*




[Figure 34](#_bookmark207)* *shows the bootloader selection mechanism.

**Figure** **34.** **Bootloader** **selection** **for** **STM32F301xx/302x4(6/8)**

























| Disable other interfaces clock’s |  |
| --- | --- |
|  |  |





[Table 56](#_bookmark209)* *lists the STM32F301xx/302x4(6/8) devices bootloader versions:

**Table** **56.** **STM32F301xx/302x4(6/8)** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V4.0 | Initial bootloader version | – USB bootloader fails on some machines using a high speed controller. The bootloader is detected. but then data transaction fails. Root causes: De-synchronization between USB controller and bootloader SW due to the controller high speed transactions. Controller high speed inter-packet delay seems not sufficient for the bootloader SW (based on interrupt routines) to serve all needed transactions (the delay needed by the BL is nearly 25 µs). Some servicing IT are missed. This results in a communication fail, causing Write command to fail. Workarounds: Add USB HUB between host and the MCU. This relaxes transactions inter-packet delay, and allows the BL SW to perform correctly the task. Use USB controller/host that increase inter-packet delay. On new designs, use DFU SW that fix the issue in user flash memory. |





### Bootloader configuration

The STM32F302xB(C)/303xB(C) bootloader is activated by applying Pattern 2 (described in
[Table 2](#_bookmark7)). [Table 57](#_bookmark212)* *shows the hardware resources used by this bootloader.

**Table** **57.** **STM32F302xB(C)/303xB(C)** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | At startup, the system clock frequency is configured to 48 MHz using the HSI. If an external clock (HSE) is not present, the system is kept clocked from the HSI. |
|  |  | HSE enabled | The external clock can be used for all bootloader interfaces and must have one the following values: 24, 18,16, 12, 9, 8, 6, 4, 3 MHz. The PLL is used to generate the USB 48 MHz clock and the 48 MHz clock for the system clock. |
|  |  | - | The CSS interrupt is enabled for the DFU. Any failure (or removal) of the external clock generates system reset. |
|  | RAM | - | 5 Kbytes, starting from address 0x20000000, are used by the bootloader firmware. |
|  | System memory | - | 8 Kbytes, starting from address 0x1FFFD800, contains the bootloader firmware. |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value and is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| USART1 | USART1 | Enabled | Once initialized, the USART1 configuration is 8 bits, even parity, and one stop bit. |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART2 | USART2 | Enabled | Once initialized, the USART2 configuration is 8 bits, even parity, and one stop bit. The USART2 uses its remapped pins. |
|  | USART2_RX pin | Input | PD6 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PD5 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx bootloader. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| DFU | USB | Enabled | USB used in FS mode |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in alternate push-pull, no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in alternate push-pull, no pull mode. An external pull-up resistor 1.5 KΩ must be connected to USB_DP pin. |


The bootloader has two cases of operation depending on the presence of the external clock (HSE) at bootloader startup:
    - If HSE is present and has a value of 24, 18, 16, 12, 9, 8, 6, 4 or 3 MHz, the system clock is configured to 48 MHz with HSE as clock source. The DFU interface, USART1 and USART2 are functional and can be used to communicate with the bootloader device.
    - If HSE is not present, the HSI is kept as default clock source, and only USART1 and USART2 are functional.
*The** **external** **clock** **(HSE)** **must** **be** **kept** **if** **it** **is** **connected** **at** **bootloader** **startup,** **because** **it** **is** used as system clock source.*




[Figure 35](#_bookmark214)* *shows the bootloader selection mechanism.

**Figure** **35.** **Bootloader** **selection** **for** **STM32F302xB(C)/303xB(C)** **devices**

























| Disable all interrupt sources |  |
| --- | --- |
|  |  |











### Bootloader version

[Table 58](#_bookmark216)* *lists the STM32F302xB(C)/303xB(C) devices bootloader versions.

**Table** **58.** **STM32F302xB(C)/303xB(C)** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V4.1 | Initial bootloader version | None |





### Bootloader configuration

The STM32F302xD(E)/303xD(E) bootloader is activated by applying Pattern 2 (described in
[Table 2](#_bookmark7)). [Table 59](#_bookmark219)* *shows the hardware resources used by this bootloader.

**Table** **59.STM32F302xD(E)/303xD(E)** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 48 MHz with HSI48 48 MHz as clock source. |
|  |  | HSE enabled | The external clock can be used for all bootloader interfaces and must have one the following values: 24, 18, 16, 12, 9, 8, 6, 4, 3 MHz. The PLL is used to generate the USB 48 MHz clock and the 48 MHz clock for the system clock. |
|  |  | - | The CSS interrupt is enabled for the DFU. Any failure (or removal) of the external clock generates system reset. |
|  | RAM | - | 6 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 8 Kbytes, starting from address 0x1FFFD800, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |
| DFU | USB | Enabled | USB FS configured in forced device mode. USB FS interrupt vector is enabled and used for USB DFU communications. |
|  | USB_DM pin | Input/output | PA11 pin: USB FS DM line. Used in alternate push-pull, no pull mode. |
|  | USB_DP pin |  | PA12 pin: USB FS DP line. Used in alternate push-pull, no pull mode. An external pull-up resistor 1.5 KΩ must be connected to USB_DP pin. |



The bootloader has two cases of operation depending on the presence of the external clock (HSE) at bootloader startup:
    - If HSE is present and has a value of 24, 18, 16, 12, 9, 8, 6, 4 or 3 MHz, the system clock is configured to 48 MHz with HSE as clock source. The DFU interface, USART1 and USART2 are functional and can be used to communicate with the bootloader device.
    - If HSE is not present, the HSI is kept as default clock source, and only USART1 and USART2 are functional.
*The** **external** **clock** **(HSE)** **must** **be** **kept** **if** **it** **is** **connected** **at** **bootloader** **startup,** **because** **it** **is** used as system clock source.*




**Figure** **36.** **Bootloader** **selection** **for** **STM32F302xD(E)/303xD(E)**

### Bootloader version

**Table** **60.**	**STM32F302xD(E)/303xD(E)** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V4.0 | Initial bootloader version | – The USB bootloader fails on some machines using a high speed controller. The bootloader is detected. but then data transaction fails. Root causes: De-synchronization between USB controller and bootloader SW due to the controller high speed transactions. Controller high speed inter-packet delay seems not sufficient for the bootloader SW (based on interrupt routines) to serve all needed transactions (the delay needed by the BL is nearly 25 µs). Some servicing IT are missed. This results in a communication fail, causing Write command to fail. Workarounds: Add an USB HUB between the host and the MCU. This relaxes transactions inter-packet delay, and allows the BL SW to perform correctly the task. Use USB controller/host that increase inter-packet delay. On new designs, use DFU SW that fix the issue in user flash memory. |





### Bootloader configuration

The STM32F303x4(6/8)/334xx/328xx bootloader is activated by applying Pattern 2 (described in [Table 2](#_bookmark7)). [Table 61](#_bookmark226)* *shows the hardware resources used by this bootloader.

**Table** **61.** **STM32F303x4(6/8)/334xx/328xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 60 MHz with HSI 8 MHz as clock source. |
|  | RAM | - | 6 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 8 Kbytes, starting from address 0x1FFFD800, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 400 kHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b0111111x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin | Input/output | PB7 pin: data line is used in open-drain no pull mode. |


The system clock is derived from the embedded internal high-speed RC. No external quartz is required for the bootloader execution.

### Bootloader selection

[Figure 37](#_bookmark228)* *shows the bootloader selection mechanism.

**Figure** **37.** **Bootloader** **selection** **for** **STM32F303x4(6/8)/334xx/328xx**

















| Configure USARTx |  |
| --- | --- |
|  |  |











### Bootloader version

[Table 62](#_bookmark230)* *lists the STM32F303x4(6/8)/334xx/328xx devices bootloader versions:

**Table** **62.** **STM32F303x4(6/8)/334xx/328xx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V5.0 | Initial bootloader version | None |





### Bootloader configuration

The STM32F318xx bootloader is activated by applying Pattern 2 (described in [Table 2](#_bookmark7)). [Table 63](#_bookmark233)* *shows the hardware resources used by this bootloader.

**Table** **63.** **STM32F318xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 60 MHz with HSI 8 MHz as clock source. |
|  | RAM | - | 6 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 8 Kbytes, starting from address 0x1FFFD800, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value, and periodically refreshed to prevent a reset (if the hardware IWDG option was previously enabled by the user). |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b0111101x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin |  | PB7 pin: data line is used in open-drain no pull mode. |



**Table** **63.** **STM32F318xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b0111101x (x = 0 for write and x = 1 for read) and digital filter disabled. |
|  | I2C3_SCL pin | Input/output | PA8 pin: clock line is used in open-drain no pull mode. |
|  | I2C3_SDA pin |  | PB5 pin: data line is used in open-drain no pull mode. |


The system clock is derived from the embedded internal high-speed RC. No external quartz is required for the bootloader execution.


### Bootloader selection

**Figure** **38.** **Bootloader** **selection** **for** **STM32F318xx**















| Configure USARTx |  |
| --- | --- |
|  |  |


### Bootloader version

**Table** **64.** **STM32F318xx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V5.0 | Initial bootloader version | None |


## STM32F358xx devices


### Bootloader configuration

The STM32F358xx bootloader is activated by applying Pattern 2 (described in [Table 2](#_bookmark7)). [Table 65](#_bookmark240)* *shows the hardware resources used by this bootloader.

**Table** **65.** **STM32F358xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 8 MHz using the HSI. |
|  | RAM | - | 5 Kbytes, starting from address 0x20000000, are used by the bootloader firmware. |
|  | System memory | - | 8 Kbytes, starting from address 0x1FFFD800, contains the bootloader firmware. |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value and is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). Window feature is disabled. |
| USART1 | USART1 | Enabled | Once initialized, the USART1 configuration is 8 bits, even parity, and one stop bit. |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART2 | USART2 | Enabled | Once initialized, the USART2 configuration is 8 bits, even parity, and one stop bit. The USART2 uses its remapped pins. |
|  | USART2_RX pin | Input | PD6 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PD5 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx bootloader. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b0110111x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin |  | PB7 pin: data line is used in open-drain no pull mode. |


The system clock is derived from the embedded internal high-speed RC. No external quartz is required for the bootloader execution.

### Bootloader selection

[Figure 39](#_bookmark242)* *shows the bootloader selection mechanism.

**Figure** **39.** **Bootloader** **selection** **for** **STM32F358xx** **devices**

















| Configure USARTx |  |
| --- | --- |
|  |  |











### Bootloader version

[Table 66](#_bookmark244)* *lists the STM32F358xx devices bootloader versions.
**Table** **66.** **STM32F358xx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V5.0 | Initial bootloader version | For USART1 and USART2 interfaces, the maximum baudrate supported by the bootloader is 57600 baud. |





### Bootloader configuration

The STM32F373xx bootloader is activated by applying Pattern 2 (described in [Table 2](#_bookmark7)). [Table 67](#_bookmark247)* *shows the hardware resources used by this bootloader.

**Table** **67.** **STM32F373xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | At startup, the system clock frequency is configured to 48 MHz using the HSI. If an external clock (HSE) is not present, the system is kept clocked from the HSI. |
|  |  | HSE enabled | The external clock can be used for all bootloader interfaces and must have one the following values: 24, 18, 16, 12, 9, 8, 6, 4, 3 MHz. The PLL is used to generate the USB 48 MHz clock and the 48 MHz clock for the system clock. |
|  |  | - | The CSS interrupt is enabled for the DFU. Any failure (or removal) of the external clock generates system reset. |
|  | RAM | - | 5 Kbytes, starting from address 0x20000000, are used by the bootloader firmware. |
|  | System memory | - | 8 Kbytes, starting from address 0x1FFFD800, contains the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value and is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| USART1 | USART1 | Enabled | Once initialized, the USART1 configuration is 8 bits, even parity, and one stop bit. |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART2 | USART2 | Enabled | Once initialized, the USART2 configuration is 8 bits, even parity, and one stop bit. The USART2 uses its remapped pins. |
|  | USART2_RX pin | Input | PD6 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PD5 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx bootloader. |



**Table** **67.** **STM32F373xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| DFU | USB | Enabled | USB used in FS mode |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in alternate push-pull, no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in alternate push-pull, no pull mode. An external pull-up resistor 1.5 KΩ must be connected to USB_DP pin. |


There are two operation modes, depending upon the presence of the external clock (HSE) at bootloader startup:
    - If HSE is present and has a value of 24, 18, 16, 12, 9, 8, 6, 4, or 3 MHz, the system clock is configured to 48 MHz with HSE as clock source. The DFU interface, USART1 and USART2 are functional and can be used to communicate with the bootloader.
    - If HSE is not present, the HSI is kept as default clock source, and only USART1 and USART2 are functional.
*Note:**	The** **external** **clock** **(HSE)** **must** **be** **kept** **if** **it** **is** **connected** **at** **bootloader** **startup,** **because** **it** **is** used as system clock source.*




[Figure 40](#_bookmark249)* *shows the bootloader selection mechanism.

**Figure** **40.** **Bootloader** **selection** **for** **STM32F373xx** **devices**

























| Disable all interrupt sources |  |
| --- | --- |
|  |  |











### Bootloader version

[Table 68](#_bookmark251)* *lists the STM32F373xx devices bootloader versions.


**Table** **68.** **STM32F373xx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V4.1 | Initial bootloader version | – The USB bootloader fails on some machines using a high speed controller. The bootloader is detected. but then data transaction fails. Root causes: De-synchronization between USB controller and bootloader SW due to the controller high speed transactions. Controller high speed inter-packet delay seems not sufficient for the bootloader SW (based on interrupt routines) to serve all needed transactions (the delay needed by the BL is nearly 25 µs). Some servicing IT are missed. This results in a communication fail, causing Write command to fail. Workarounds: Add an USB HUB between the host and the MCU. This relaxes transactions inter-packet delay, and allows the BL SW to perform correctly the task. Use USB controller/host that increase inter-packet delay. On new designs, use DFU SW that fix the issue in user flash memory. |





### Bootloader configuration

The STM32F378xx bootloader is activated by applying Pattern 2 (described in [Table 2](#_bookmark7)). [Table 69](#_bookmark254)* *shows the hardware resources used by this bootloader.

**Table** **69.** **STM32F378xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 8 MHz using the HSI. |
|  | RAM | - | 4 Kbytes, starting from address 0x20000000, are used by the bootloader firmware. |
|  | System memory | - | 8 Kbytes, starting from address 0x1FFFD800, contains the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value and is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). Window feature is disabled. |
| USART1 | USART1 | Enabled | Once initialized, the USART1 configuration is 8 bits, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART2 | USART2 | Enabled | Once initialized, the USART2 configuration is 8 bits, even parity, and one stop bit. The USART2 uses its remapped pins. |
|  | USART2_RX pin | Input | PD6 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PD5 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx bootloader. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b0110111x (x = 0 for write and x = 1 for read). |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin |  | PB7 pin: data line is used in open-drain no pull mode. |


The system clock is derived from the embedded internal high-speed RC. No external quartz is required for the bootloader execution.

### Bootloader selection

[Figure 41](#_bookmark256)* *shows the bootloader selection mechanism.

**Figure** **41.** **Bootloader** **selection** **for** **STM32F378xx** **devices**
















| Configure USARTx |  |
| --- | --- |
|  |  |












### Bootloader version

[Table 70](#_bookmark258)* *lists the STM32F378xx devices bootloader versions.
**Table** **70.** **STM32F378xx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V5.0 | Initial bootloader version | For USART1 and USART2 interfaces, the maximum baudrate supported by the bootloader is 57600 baud. |





### Bootloader configuration

The STM32F398xx bootloader is activated by applying Pattern 2 (described in [Table 2](#_bookmark7)). [Table 71](#_bookmark261)* *shows the hardware resources used by this bootloader.

**Table** **71.STM32F398xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 60 MHz with HSI 8 MHz as clock source. |
|  | RAM | - | 6 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 7 Kbytes, starting from address 0x1FFFD800, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1000000x (x = 0 for write and x = 1 for read). |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin |  | PB7 pin: data line is used in open-drain no pull mode. |



**Table** **71.STM32F398xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 400 kHz 7-bit address, Target mode Analog filter ON Target 7-bit address: 0b1000000x (x = 0 for write and x = 1 for read). |
|  | I2C3_SCL pin | Input/output | PA8 pin: clock line is used in open-drain no pull mode. |
|  | I2C3_SDA pin |  | PB5 pin: data line is used in open-drain no pull mode. |

The system clock is derived from the embedded internal high-speed RC for all bootloader interfaces. No external quartz is required for bootloader operations.


### Bootloader selection

[Figure 42](#_bookmark263)* *shows the bootloader selection mechanism.

**Figure** **42.Bootloader** **selection** **for** **STM32F398xx**




[Table 72](#_bookmark265)* *lists the STM32F398xx devices bootloader versions.

**Table** **72.** **STM32F398xx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V5.0 | Initial bootloader version | None |





### Bootloader V3.x

#### Bootloader configuration

The STM32F40xxx/41xxx bootloader is activated by applying Pattern 1 (described in
[Table 2](#_bookmark7)). [Table 73](#_bookmark269)* *shows the hardware resources used by this bootloader.

**Table** **73.** **STM32F40xxx/41xxx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 24 MHz using the PLL. The HSI clock source is used at startup (interface detection phase) and when USARTx interfaces are selected (once CAN or DFU is selected, the clock source is derived from the external crystal). |
|  |  | HSE enabled | The system clock frequency is 60 MHz. The HSE clock source is used only when the CAN or the DFU (USB FS device) interfaces are selected. The external clock must provide a frequency multiple of 1 MHz and ranging from 4 to 26 MHz. |
|  |  | - | The CSS interrupt is enabled for the CAN and DFUs. Any failure (or removal) of the external clock generates system reset. |
|  | RAM | - | 8 Kbytes, starting from address 0x20000000, are used by the bootloader firmware. |
|  | System memory | - | 29 Kbytes, starting from address 0x1FFF 0000 contain the bootloader firmware. |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
|  | Power | - | Voltage range is set to [1.62 V, 2.1 V]. In this range internal flash write operations are allowed only in byte format (half-word, word, and double-word operations are not allowed). The voltage range can be configured in run time using bootloader commands. |
| USART1 | USART1 | Enabled | Once initialized, the USART1 configuration is 8 bits, even parity, and one stop bit. |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in input no pull mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in input no pull mode |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| USART3 (on PB10/PB11) | USART3 | Enabled | Once initialized, the USART3 configuration is 8 bits, even parity, and one stop bit. |
|  | USART3_RX pin | Input | PB11 pin: USART3 in reception mode. Used in input pull-up mode. |
|  | USART3_TX pin | Output | PB10 pin: USART3 in transmission mode. Used in input pull-up mode. |
| USART3 (on PC10/PC11) | USART3 | Enabled | Once initialized, the USART3 configuration is 8 bits, even parity, and one stop bit. |
|  | USART3_RX pin | Input | PC11 pin: USART3 in reception mode. used in input pull-up mode. |
|  | USART3_TX pin | Output | PC10 pin: USART3 in transmission mode. used in input pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |
| CAN2 | CAN2 | Enabled | Once initialized, the CAN2 configuration is: Baudrate 125 kbps, 11-bit identifier. Note: CAN1 is clocked during CAN2 bootloader execution because CAN1 manages the communication between CAN2 and SRAM. |
|  | CAN2_RX pin | Input | PB5 pin: CAN2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | CAN2_TX pin | Output | PB13 pin: CAN2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| DFU | USB | Enabled | USB OTG FS configured in forced device mode |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in alternate push-pull, no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in alternate push-pull, no pull mode. No external pull-up resistor is required |
| CAN2 and DFUs | TIM11 | Enabled | This timer is used to determine the value of the HSE. Once the HSE frequency is determined, the system clock is configured to 60 MHz using PLL and HSE. |


The system clock is derived from the embedded internal high-speed RC for USARTx. This internal clock is also used for CAN and DFU (USB FS device), but only for the selection phase. An external clock multiple of 1 MHz (between 4 and 26 MHz) is required for CAN and DFU execution after the selection phase.
*Note:**	Due** **to** **HSI** **deviation** **and** **since** **HSI** **is** **used** **to** **detect** **HSE** **value,** **use** **low** **rather** **than** **high** frequency HSE crystals (low frequency values are better detected due to larger error margin). For example, it is better to use 8 MHz instead of 25 MHz.*


#### Bootloader selection

[Figure 43](#_bookmark271)* *shows the bootloader selection mechanism.

**![](rId479)**Figure** **43.** **Bootloader** **V3.x** **selection** **for** **STM32F40xxx/41xxx** **devices**




| Disable all interrupt sources |  |
| --- | --- |
|  |  |





[Table 74](#_bookmark273)* *lists the STM32F40xxx/41xxx devices V3.x bootloader versions:

**Table** **74.** **STM32F40xxx/41xxx** **bootloader** **V3.x** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V3.0 | Initial bootloader version | When a Read Memory command or Write Memory command is issued with an unsupported memory address and a correct address checksum (i.e. address 0x6000 0000), the command is aborted by the bootloader device, but the NACK (0x1F) is not sent to the host. As a result, the next two bytes (which are the number of bytes to be read/written and its checksum) are considered as a new command and its checksum(1). Option bytes, OTP and Device Feature descriptors (in DFU interface) are set to “g” instead of “e” (not erasable memory areas). After executing Go command (jump to user code) the bootloader resets AHB1ENR value to 0x0000 0000 and thus CCM RAM, when present, is not active (must be re-enabled by user code at startup) |
| V3.1 | Fix V3.0 limitations DFU interface robustness enhancement | For the USART interface, two consecutive NACKs (instead of 1 NACK) are sent when a Read Memory or Write Memory command is sent and the RDP level is active. For the CAN interface, the Write Unprotect command is not functional. Use Write Memory command and write directly to the option bytes in order to disable the write protection. After executing Go command (jump to user code) the bootloader resets AHB1ENR value to 0x0000 0000 and thus CCM RAM, when present, is not active (must be re-enabled by user code at startup) |

1. If the “number of data - 1” (N-1) to be read/written is not equal to a valid command code (0x00, 0x01, 0x02, 0x11, 0x21, 0x31, 0x43, 0x44, 0x63, 0x73, 0x82 or 0x92), the limitation is not perceived from the host, as the command is NACK-ed anyway (as an unsupported new command).

### Bootloader V9.x

#### Bootloader configuration

The STM32F40xxx/41xxx bootloader is activated by applying Pattern 1 (described in
[Table 2](#_bookmark7)). [Table 75](#_bookmark276)* *shows the hardware resources used by this bootloader.
*Note:**	The** **bootloader** **version** **V9.0** **is** **embedded** **only** **in** **STM32F405xx/415xx** **devices** **in** WLCSP90 package.*
Version V9.1 is populated in all packages of the product.


**Table** **75.** **STM32F40xxx/41xxx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 60 MHz using the PLL. The HSI clock source is used at startup (interface detection phase) and when USART or SPI or I2C interfaces are selected (once CAN or DFU is selected, the clock source is derived from the external crystal). |
|  |  | HSE enabled | The system clock frequency is 60 MHz. The HSE clock source is used only when the CAN or the DFU (USB FS device) interfaces are selected. The external clock must provide a frequency multiple of 1 MHz and ranging from 4 MHz to 26 MHz. |
|  |  | - | The CSS interrupt is enabled for the CAN and DFUs. Any failure (or removal) of the external clock generates system reset. |
|  | RAM | - | 12 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 29 Kbytes, starting from address 0x1FFF0000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
|  | Power | - | Voltage range is set to [1.62 V, 2.1 V]. In this range internal flash write operations are allowed only in byte format (half-word, word, and double-word operations are not allowed). The voltage range can be configured in run time using bootloader commands. |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in input no pull mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in input no pull mode. |
| USART3 (on PB10/PB11) | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PB11 pin: USART3 in reception mode. Used in input pull-up mode. |
|  | USART3_TX pin | Output | PB10 pin: USART3 in transmission mode |
| USART3 (on PC10/PC11) | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PC11 pin: USART3 in reception mode. Used in input pull-up mode. |
|  | USART3_TX pin | Output | PC10 pin: USART3 in transmission mode. Used in input pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| CAN2 | CAN2 | Enabled | Once initialized the CAN2 configuration is: Baudrate 125 kbps, 11-bit identifier. Note: CAN1 is clocked during CAN2 bootloader execution because CAN1 manages the communication between CAN2 and SRAM. |
|  | CAN2_RX pin | Input | PB5 pin: CAN2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | CAN2_TX pin | Output | PB13 pin: CAN2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b0111010x (x = 0 for write and x = 1 for read). |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin |  | PB7 pin: data line is used in open-drain no pull mode. |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b0111010x (x = 0 for write and x = 1 for read). |
|  | I2C2_SCL pin | Input/output | PF1 pin: clock line is used in open-drain no pull mode. |
|  | I2C2_SDA pin |  | PF0 pin: data line is used in open-drain no pull mode. |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b0111010x (x = 0 for write and x = 1 for read). |
|  | I2C3_SCL pin | Input/output | PA8 pin: clock line is used in open-drain no pull mode. |
|  | I2C3_SDA pin |  | PC9 pin: data line is used in open-drain no pull mode. |



**Table** **75.** **STM32F40xxx/41xxx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI1 | SPI1 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz, Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI1_NSS pin |  | PA4 pin: slave chip select pin used in push-pull, pull-down mode. |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz, Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PI3 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI2_MISO pin | Output | PI2 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI2_SCK pin | Input | PI1 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI2_NSS pin | Input | PI0 pin: slave chip select pin used in push-pull, pull-down mode. |
| DFU | USB | Enabled | USB OTG FS configured in forced device mode |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in alternate push-pull, no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in alternate push-pull, no pull mode. No external pull-up resistor is required |
| CAN2 and DFUs | TIM11 | Enabled | This timer is used to determine the value of the HSE. Once the HSE frequency is determined, the system clock is configured to 60 MHz using PLL and HSE. |


The system clock is derived from the embedded internal high-speed RC for USARTx, I2Cx, and SPIx bootloaders. This internal clock is also used for CAN and DFU (USB FS device), but only for the selection phase. An external clock multiple of 1 MHz (between 4 and
26 MHz) is required for CAN and DFU execution after the selection phase.
*Note:**	Due to HSI deviation and since HSI is used to detect HSE value, use low rather than high** frequency** **HSE** **crystal** **values** **(low** **frequency** **values** **are** **better** **detected** **due** **to** **larger** **error margin). For example, it is better to use 8 MHz instead of 25 MHz.*




**Figure** **44.** **Bootloader** **V9.x** **selection** **for** **STM32F40xxx/41xxx**













| Configure USARTx |  |
| --- | --- |
|  |  |

























| Disable all interrupt sources |  |
| --- | --- |
|  |  |



#### Bootloader version

[Table 76](#_bookmark281)* *lists the STM32F40xxx/41xxx devices V9.x bootloader versions.

**Table** **76.** **STM32F40xxx/41xxx** **bootloader** **V9.x** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V9.0 | This bootloader is an updated version of bootloader v3.1. This new version of bootloader supports I2C1, I2C2, I2C3, SPI1 and SPI2 interfaces. The RAM used by this bootloader is increased from 8 to 12 Kb. The ID of this bootloader is 0x90. The connection time is increased. | For the USART interface, two consecutive NACKs (instead of 1 NACK) are sent when a Read Memory or Write Memory command is sent and the RDP level is active. For the CAN interface, the Write Unprotect command is not functional. Use Write Memory command and write directly to the option bytes in order to disable the write protection. After executing Go command (jump to user code) the bootloader resets AHB1ENR value to 0x0000 0000 and thus CCM RAM, when present, is not active (must be re-enabled by user code at startup) |
| V9.1 | This bootloader is an updated version of bootloader v9.0 that will be populated in all packages even the one embedding the V3.1 bootloader version. It contains fixes of the known limitations of the V9.0 | None |





### Bootloader configuration

The STM32F401xB(C) bootloader is activated by applying Pattern 1 (described in [Table 2](#_bookmark7)). [Table 77](#_bookmark284)* *shows the hardware resources used by this bootloader.

**Table** **77.** **STM32F401xB(C)** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 60 MHz using the PLL. The HSI clock source is used at startup (interface detection phase) and when USART or SPI or I2C interface is selected (once DFU is selected, the clock source is derived from the external crystal). |
|  |  | HSE enabled | The system clock frequency is 60 MHz. The HSE clock source is used only when the DFU (USB FS device) interface is selected. The external clock must provide a frequency multiple of 1 MHz and ranging from 4 to 26 MHz. |
|  |  | - | The CSS interrupt is enabled for the CAN and DFUs. Any failure (or removal) of the external clock generates system reset. |
|  | RAM | - | 12 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 29 Kbytes, starting from address 0x1FFF0000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
|  | Power | - | Voltage range is set to [1.62 V, 2.1 V]. In this range internal flash write operations are allowed only in byte format (half-word, word, and double-word operations are not allowed). The voltage range can be configured in run time using bootloader commands. |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in input no pull mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in input no pull mode. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PD6 pin: USART2 in reception mode. Used in input pull-up mode. |
|  | USART2_TX pin | Output | PD5 pin: USART2 in transmission mode. Used in input pull-up mode. |



**Table** **77.** **STM32F401xB(C)** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b0111010x (x = 0 for write and x = 1 for read). |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin |  | PB7 pin: data line is used in open-drain no pull mode. |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b0111010x (x = 0 for write and x = 1 for read). |
|  | I2C2_SCL pin | Input/output | PB10 pin: clock line is used in open-drain no pull mode. |
|  | I2C2_SDA pin |  | PB3 pin: data line is used in open-drain no pull mode. |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b0111010x (x = 0 for write and x = 1 for read). |
|  | I2C3_SCL pin | Input/output | PA8 pin: clock line is used in open-drain no pull mode. |
|  | I2C3_SDA pin |  | PB4 pin: data line is used in open-drain no pull mode. |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI1_NSS pin |  | PA4 pin: slave chip select pin used in push-pull, pull-down mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PB15 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI2_MISO pin | Output | PB14 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI2_SCK pin | Input | PB13 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI2_NSS pin |  | PB12 pin: slave chip select pin used in push-pull, pull-down mode. |
| SPI3 | SPI3 | Enabled | The SPI3 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI3_MOSI pin | Input | PC12 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI3_MISO pin | Output | PC11 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI3_SCK pin | Input | PC10 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI3_NSS pin |  | PA15 pin: slave chip select pin used in push-pull, pull-down mode. |
| DFU | USB | Enabled | USB OTG FS configured in forced device mode |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in alternate push-pull, no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in alternate push-pull, no pull mode. No external pull-up resistor is required |
|  | TIM11 | Enabled | This timer is used to determine the value of the HSE. Once the HSE frequency is determined, the system clock is configured to 60 MHz using PLL and HSE. |


The system clock is derived from the embedded internal high-speed RC for USARTx, I2Cx, and SPIx bootloaders. This internal clock is also used for CAN and DFU (USB FS device), but only for the selection phase. An external clock, multiple of 1 MHz (between 4 and
26 MHz), is required for CAN and DFU execution after the selection phase.


*Note:**	Due to HSI deviation and since HSI is used to detect HSE value, use low rather than high** frequency** **HSE** **crystal** **values** **(low** **frequency** **values** **are** **better** **detected** **due** **to** **larger** **error margin). For example, it is better to use 8 MHz instead of 25 MHz.*


### Bootloader selection

**Figure** **45.** **Bootloader** **selection** **for** **STM32F401xB(C)**








| Disable all interrupt sources |  |
| --- | --- |
|  |  |


| Configure USARTx |  |
| --- | --- |
|  |  |












| Disable all interrupt sources |  |
| --- | --- |
|  |  |






| Disable all interrupt sources |  |
| --- | --- |
|  |  |





**Table** **78.** **STM32F401xB(C)** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V13.0 | Initial bootloader version | After executing Go command (jump to user code) the bootloader resets AHB1ENR value to 0x0000 0000 and thus CCM RAM, when present, is not active (must be re-enabled by user code at startup) The bootloader does not support the reset of SPRMOD bit during RDP regression |


## STM32F401xD(E) devices


### Bootloader configuration

The STM32F401xD(E) bootloader is activated by applying Pattern 1 (described in [Table 2](#_bookmark7)). [Table 79](#_bookmark291)* *shows the hardware resources used by this bootloader.

**Table** **79.** **STM32F401xD(E)** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 60 MHz using the PLL. The HSI clock source is used at startup (interface detection phase) and when USART or SPI or I2C interface is selected (once DFU is selected, the clock source is derived from the external crystal). |
|  |  | HSE enabled | The system clock frequency is 60 MHz. The HSE clock source is used only when the DFU (USB FS device) interface is selected. The external clock must provide a frequency multiple of 1 MHz, ranging from 4 to 26 MHz. |
|  |  | - | The CSS interrupt is enabled for the DFU. Any failure (or removal) of the external clock generates system reset. |
|  | RAM | - | 12 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 29 Kbytes, starting from address 0x1FFF0000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
|  | Power | - | Voltage range is set to 1.62 V, 2.1 V. In this range internal flash write operations are allowed only in byte format (half-word, word, and double-word operations are not allowed). The voltage range can be configured in run time using bootloader commands. |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in no pull mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in no pull mode. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PD6 pin: USART2 in reception mode. Used in pull-up mode. |
|  | USART2_TX pin | Output | PD5 pin: USART2 in transmission mode. Used in pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b0111001x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin |  | PB7 pin: data line is used in open-drain no pull mode. |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b0111001x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PB10 pin: clock line is used in open-drain no pull mode. |
|  | I2C2_SDA pin |  | PB3 pin: data line is used in open-drain no pull mode. |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b0111001x (x = 0 for write and x = 1 for read) |
|  | I2C3_SCL pin | Input/output | PA8 pin: clock line is used in open-drain no pull mode. |
|  | I2C3_SDA pin |  | PB4 pin: data line is used in open-drain no pull mode. |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in push-pull, pull-down mode. |



**Table** **79.** **STM32F401xD(E)** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PB15 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI2_MISO pin | Output | PB14 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI2_SCK pin | Input | PB13 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI2_NSS pin | Input | PB12 pin: slave chip select pin used in push-pull, pull-down mode. |
| SPI3 | SPI3 | Enabled | The SPI3 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI3_MOSI pin | Input | PC12 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI3_MISO pin | Output | PC11 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI3_SCK pin | Input | PC10 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI3_NSS pin | Input | PA15 pin: slave chip select pin used in push-pull, pull-down mode. |
| DFU | USB | Enabled | USB OTG FS configured in forced device mode |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in alternate push-pull, no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in alternate push-pull, no pull mode. No external pull-up resistor is required |
|  | TIM11 | Enabled | This timer is used to determine the value of the HSE. Once the HSE frequency is determined, the system clock is configured to 60 MHz using PLL and HSE. |


The system clock is derived from the embedded internal high-speed RC for USARTx, I2Cx, and SPIx bootloaders. This internal clock is also used for DFU (USB FS device), but only for the selection phase. An external clock multiple of 1 MHz (between 4 and 26 MHz) is required for DFU execution after the selection phase.
*Note:**	Due to HSI deviation and since HSI is used to detect HSE value, use low rather than high** frequency** **HSE** **crystal** **values** **(low** **frequency** **values** **are** **better** **detected** **due** **to** **larger** **error margin). For example, it is better to use 8 MHz instead of 25 MHz.*




[Figure 46](#_bookmark293)* *shows the bootloader selection mechanism.

**Figure** **46.** **Bootloader** **selection** **for** **STM32F401xD(E)**








| Disable all interrupt sources |  |
| --- | --- |
|  |  |


| Configure USARTx |  |
| --- | --- |
|  |  |












| Disable all interrupt sources |  |
| --- | --- |
|  |  |






| Disable all interrupt sources |  |
| --- | --- |
|  |  |


### Bootloader version

[Table 80](#_bookmark295)* *lists the STM32F401xD(E) devices bootloader version.

**Table** **80.** **STM32F401xD(E)** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V13.1 | Initial bootloader version | After executing Go command (jump to user code) the bootloader resets AHB1ENR value to 0x0000 0000 and thus CCM RAM, when present, is not active (must be re-enabled by user code at startup) |





### Bootloader configuration

The STM32F410xx bootloader is activated by applying Pattern 1 (described in [Table 2](#_bookmark7)). [Table 81](#_bookmark298)* *shows the hardware resources used by this bootloader.

**Table** **81.** **STM32F410xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The HSI is used at startup as clock source for system clock configured to 60 MHz and for USART and I2C bootloader operation. |
|  | RAM | - | 5 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 29 Kbytes, starting from address 0x1FFF0000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
|  | Power | - | The voltage range is [1.8V, 3.6V]. In this range: Flash wait states: 3. System clock frequency 60 MHz. ART Accelerator enabled. Flash write operation by byte (refer to bootloader memory management section for more information). |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |



**Table** **81.** **STM32F410xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1000111x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin |  | PB7 pin: data line is used in open-drain no pull mode. |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1000111x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PB10 pin: clock line is used in open-drain no pull mode. |
|  | I2C2_SDA pin |  | PB11 pin: data line is used in open-drain no pull mode. |
| I2C4 | I2C4 | Enabled | The I2C4 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1000111x (x = 0 for write and x = 1 for read) |
|  | I2C4_SCL pin | Input/output | PB15 pin: clock line is used in open-drain no pull mode for STM32F410Cx/Rx devices. PB10 pin: clock line is used in open-drain no pull mode for STM32F410Tx devices. |
|  | I2C4_SDA pin | Input/output | PB14 pin: data line is used in open-drain no pull mode for STM32F410Cx/Rx devices. PB3 pin: data line is used in open-drain no pull mode for STM32F410Tx devices. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, pull-down mode for STM32F410Cx/Rx devices. PB5 pin: slave data input line, used in push-pull, pull-down mode for STM32F410Tx devices. |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, pull-down mode for STM32F410Cx/Rx devices. PB4 pin: slave data output line, used in push-pull, pull-down mode for STM32F410Tx devices. |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, pull-down mode. |
|  | SPI1_NSS pin |  | PA4 pin: slave chip select pin used in push-pull, pull-up mode for STM32F410Cx/Rx devices. PA15 pin: slave chip select pin used in push-pull, pull-down mode for STM32F410Tx devices. |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PC3 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI2_MISO pin | Output | PC2 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI2_SCK pin | Input | PB13 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI2_NSS pin | Input | PB12 pin: slave chip select pin used in push-pull, pull-down mode. |


The system clock is derived from the embedded internal high-speed RC for all bootloader interfaces. No external quartz is required for bootloader operations.

### Bootloader selection

[Figure 47](#_bookmark300)* *shows the bootloader selection mechanism.

**Figure** **47.Bootloader** **V11.x** **selection** **for** **STM32F410xx**





| Disable all interrupt sources |  |
| --- | --- |
|  |  |


























[Table 82](#_bookmark302)* *lists the STM32F410xx devices bootloader V11.x versions.

**Table** **82.**	**STM32F410xx** **bootloader** **V11.x** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V11.0 | Initial bootloader version | After executing Go command (jump to user code) the bootloader resets AHB1ENR value to 0x0000 0000 and thus CCM RAM, when present, is not active (must be re-enabled by user code at startup) |
| V11.1 | Support I2C4 and SPI1 for STM32F410Tx devices | After executing Go command (jump to user code) the bootloader resets AHB1ENR value to 0x0000 0000 and thus CCM RAM, when present, is not active (must be re-enabled by user code at startup) |





### Bootloader configuration

The STM32F411xx bootloader is activated by applying Pattern 1 (described in [Table 2](#_bookmark7)). [Table 83](#_bookmark305)* *shows the hardware resources used by this bootloader.

**Table** **83.** **STM32F411xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 60 MHz using the PLL. The HSI clock source is used at startup (interface detection phase) and when USART or SPI or I2C interface is selected (once DFU is selected, the clock source is derived from the external crystal). |
|  |  | HSE enabled | The system clock frequency is 60 MHz. The HSE clock source is used only when the DFU (USB FS device) interface is selected. The external clock must provide a frequency multiple of 1 MHz and ranging from 4 MHz to 26 MHz. |
|  |  | - | The CSS interrupt is enabled for the DFU. Any failure (or removal) of the external clock generates system reset. |
|  | RAM | - | 12 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 29 Kbytes, starting from address 0x1FFF0000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hard-ware IWDG option was previously enabled by the user). |
|  | Power | - | Voltage range is set to [1.62 V, 2.1 V]. In this range internal flash write operations are allowed only in byte format (half-word, word, and double-word operations are not allowed). The voltage range can be configured in run time using bootloader commands. |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in input no pull mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in input no pull mode. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PD6 pin: USART2 in reception mode. Used in input pull-up mode. |
|  | USART2_TX pin | Output | PD5 pin: USART2 in transmission mode. Used in input pull-up mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b0111001x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin |  | PB7 pin: data line is used in open-drain no pull mode. |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b0111001x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PB10 pin: clock line is used in open-drain no pull mode. |
|  | I2C2_SDA pin |  | PB3 pin: data line is used in open-drain no pull mode. |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b0111001x (x = 0 for write and x = 1 for read) |
|  | I2C3_SCL pin | Input/output | PA8 pin: clock line is used in open-drain no pull mode. |
|  | I2C3_SDA pin |  | PB4 pin: data line is used in open-drain no pull mode. |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in push-pull, pull-down mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware |
|  | SPI2_MOSI pin | Input | PB15 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI2_MISO pin | Output | PB14 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI2_SCK pin | Input | PB13 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI2_NSS pin | Input | PB12 pin: slave chip select pin used in push-pull, pull-down mode. |
| SPI3 | SPI3 | Enabled | The SPI3 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware |
|  | SPI3_MOSI pin | Input | PC12 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI3_MISO pin | Output | PC11 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI3_SCK pin | Input | PC10 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI3_NSS pin | Input | PA15 pin: slave chip select pin used in push-pull, pull-down mode. |
| DFU | USB | Enabled | USB OTG FS configured in forced device mode |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in alternate push-pull, no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in alternate push-pull, no pull mode. No external pull-up resistor is required |
|  | TIM11 | Enabled | This timer is used to determine the value of the HSE. Once the HSE frequency is determined, the system clock is configured to 60 MHz using PLL and HSE. |


The system clock is derived from the embedded internal high-speed RC for USARTx, I2Cx I2Cx, and SPIx bootloaders. This internal clock is also used for DFU (USB FS device), but only for the selection phase. An external clock multiple of 1 MHz (between 4 and 26 MHz) is required for DFU execution after the selection phase.
*Note:**	Due to HSI deviation and since HSI is used to detect HSE value, use low rather than high** frequency** **HSE** **crystal** **values** **(low** **frequency** **values** **are** **better** **detected** **due** **to** **larger** **error margin). For example, it is better to use 8 MHz instead of 25 MHz.*




[Figure 48](#_bookmark307)* *shows the bootloader selection mechanism.

**Figure** **48.** **Bootloader** **selection** **for** **STM32F411xx**









| Disable all interrupt sources |  |
| --- | --- |
|  |  |


| Configure USARTx |  |
| --- | --- |
|  |  |












| Disable all interrupt sources |  |
| --- | --- |
|  |  |






| Disable all interrupt sources |  |
| --- | --- |
|  |  |





The following table lists the STM32F411xx devices bootloader version.

**Table 84.** **STM32F411xx bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V13.0 | Initial bootloader version | After executing Go command (jump to user code) the bootloader resets AHB1ENR value to 0x0000 0000 and thus CCM RAM, when present, is not active (must be re-enabled by user code at startup) |





### Bootloader configuration

The STM32F412xx bootloader is activated by applying Pattern 1 (described in [Table 2](#_bookmark7)). [Table 85](#_bookmark312)* *shows the hardware resources used by this bootloader.

**Table** **85.STM32F412xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The HSI is used at startup as clock source for system clock configured to 60 MHz and for USART and I2C bootloader operation. |
|  |  | HSE enabled | The HSE is used only when the CAN or the DFU (USB FS device) interfaces are selected. In this case the system clock is configured to 60 MHz with HSE as clock source. The HSE frequency must be a multiple of 1 MHz, ranging from 4 to 26 MHz. |
|  |  | - | The CSS interrupt is enabled for the CAN and DFUs. Any failure (or removal) of the external clock generates a system reset. |
|  | RAM | - | 16 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 29 Kbytes, starting from address 0x1FFF0000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
|  | Power | - | The voltage range is [1.8V, 3.6V]. In this range: Flash wait states: 3. System clock frequency 60 MHz. ART Accelerator enabled. Flash write operation by byte (refer to bootloader memory management section for more information). |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in input no pull mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in input no pull mode. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PD6 pin: USART2 in reception mode. Used in input pull-up mode. |
|  | USART2_TX pin | Output | PD5 pin: USART2 in transmission mode. Used in input pull-up mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| USART3 | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PB11 pin: USART3 in reception mode. Used in input pull-up mode. |
|  | USART3_TX pin | Output | PB10 pin: USART3 in transmission mode. Used in input pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |
| CAN2 | CAN2 | Enabled | Once initialized the CAN2 configuration is: Baudrate 125 kbps, 11-bit identifier. Note: CAN1 is clocked during CAN2 bootloader execution because CAN1 manages the communication between CAN2 and SRAM. |
|  | CAN2_RX pin | Input | PB5 pin: CAN2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | CAN2_TX pin | Output | PB13 pin: CAN2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1000110x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin |  | PB7 pin: data line is used in open-drain no pull mode. |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1000110x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PF1 pin: clock line is used in open-drain no pull mode. |
|  | I2C2_SDA pin |  | PF0 pin: data line is used in open-drain no pull mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1000110x (x = 0 for write and x = 1 for read) |
|  | I2C3_SCL pin | Input/output | PA8 pin: clock line is used in open-drain no pull mode. |
|  | I2C3_SDA pin |  | PB4 pin: data line is used in open-drain no pull mode. |
| I2C4 | I2C4 | Enabled | The I2C4 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1000110x (x = 0 for write and x = 1 for read) |
|  | I2C4_SCL pin | Input/output | PB15 pin: clock line is used in open-drain no pull mode. |
|  | I2C4_SDA pin |  | PB14 pin: data line is used in open-drain no pull mode. |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI1_NSS pin |  | PA4 pin: slave chip select pin used in push-pull, pull-up mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI3 | SPI3 | Enabled | The SPI3 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI3_MOSI pin | Input | PC12 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI3_MISO pin | Output | PC11 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI3_SCK pin | Input | PC10 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI3_NSS pin |  | PA15 pin: slave chip select pin used in push-pull, pull-up mode. |
| SPI4 | SPI4 | Enabled | The SPI4 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI4_MOSI pin | Input | PE14 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI4_MISO pin | Output | PE13 pin: slave data output line, used in push-pull, pull-down mode |
|  | SP4_SCK pin | Input | PE12 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI4_NSS pin |  | PE11 pin: slave chip select pin used in push-pull, pull-up mode. |
| DFU | USB | Enabled | USB OTG FS configured in forced device mode |
|  | USB_DM pin | Input/output | PA11 pin: USB DM line. Used in alternate push-pull, no pull mode. |
|  | USB_DP pin |  | PA12 pin: USB DP line. Used in alternate push-pull, no pull mode. No external pull-up resistor is required. |
| CAN2 and DFUs | TIM11 | Enabled | This timer is used to determine the value of the HSE. Once HSE frequency is determined, the system clock is configured to 60 MHz using PLL and HSE. |


The system clock is derived from the embedded internal high-speed RC for USARTx and I2Cx bootloaders. This internal clock is also used for CAN and DFU (USB FS device), but only for the selection phase. An external clock multiple of 1 MHz (between 4 and 26 MHz) is required for CAN and DFU execution after the selection phase.
*Note:**	Due to HSI deviation and since HSI is used to detect HSE value, use low rather than high** frequency** **HSE** **crystal** **values** **(low** **frequency** **values** **are** **better** **detected** **due** **to** **larger** **error margin). For example, it is better to use 8 MHz instead of 25 MHz.*




[Figure 49](#_bookmark314)* *shows the bootloader selection mechanism.

**Figure** **49.Bootloader** **V9.x** **selection** **for** **STM32F412xx**



System Reset


System Init (Clock, GPIOs, IWDG, SysTick)


---


yes



yes yes




Configure SPIx



0x7F received on USARTx


---





Execute BL_SPI_Loop for SPIx


---





Execute BL_I2C_Loop for I2Cx


---

Configure USARTx

Execute BL_USART_Loop for USARTx



no

I2Cx Address Detected


---


yes



no



Synchro mechanism detected on SPIx


no
no

Frame detected on CANx


---


HSE detected


yes


---


no	no


---


HSE detected


yes

| Disable all interrupt sources and other interfaces clocks |  |
| --- | --- |
|  |  |

Reconfigure System clock to 60MHz



no


USB cable Detected


---





yes


---


Execute DFU bootloader using USB interrupts


---

Configure CANx




MSv38454V2




The following table lists the STM32F412xx devices bootloader V9.x versions.

**Table** **86.** **STM32F412xx** **bootloader** **V9.x** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V9.0 | Initial bootloader version | After executing Go command (jump to user code) the bootloader resets AHB1ENR value to 0x0000 0000 and thus CCM RAM, when present, is not active (must be re-enabled by user code at startup) |
| V9.1 | Fix USART3 interface pinout | After executing Go command (jump to user code) the bootloader resets AHB1ENR value to 0x0000 0000 and thus CCM RAM, when present, is not active (must be re-enabled by user code at startup) |





### Bootloader configuration

The STM32F413xx/423xx bootloader is activated by applying Pattern 1 (described in
[Table 2](#_bookmark7)h). The following table shows the hardware resources used by this bootloader.

**Table** **87.** **STM32F413xx/423xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The HSI is used at startup as clock source for system clock configured to 60 MHz and for USART and I2C bootloader operation. |
|  |  | HSE enabled | The HSE is used only when the CAN or the DFU (USB FS device) interfaces are selected. In this case the system clock configured to 60 MHz with HSE as clock source. The HSE frequency must be multiple of 1 MHz and ranging from 4 MHz to 26 MHz. |
|  |  | - | The CSS interrupt is enabled for the CAN and DFUs. Any failure (or removal) of the external clock generates system reset. |
|  | RAM | - | 16 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 60 Kbytes, starting from address 0x1FF00000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
|  | Power | - | The voltage range is [1.8V, 3.6V] In this range: Flash wait states 4. System clock frequency 60 MHz. ART Accelerator enabled. Flash write operation by byte (refer to Bootloader memory management for more information). |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in input no pull mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in input no pull mode. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PD6 pin: USART2 in reception mode. Used in input pull-up mode. |
|  | USART2_TX pin | Output | PD5 pin: USART2 in transmission mode. Used in input pull-up mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| USART3 | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PB11 pin: USART3 in reception mode. Used in input pull-up mode. |
|  | USART3_TX pin | Output | PB10 pin: USART3 in transmission mode. Used in input pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |
| CAN2 | CAN2 | Enabled | Once initialized the CAN2 configuration is: Baudrate 125 kbps, 11-bit identifier. Note: CAN1 is clocked during CAN2 bootloader execution because CAN1 manages the communication between CAN2 and SRAM. |
|  | CAN2_RX pin | Input | PB5 pin: CAN2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | CAN2_TX pin | Output | PB13 pin: CAN2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 400 kHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b1001011x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin | Input/output | PB7 pin: data line is used in open-drain no pull mode. |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 400 kHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b1001011x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PF1 pin: clock line is used in open-drain no pull mode. |
|  | I2C2_SDA pin | Input/output | PF0 pin: data line is used in open-drain no pull mode. |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 400 kHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b1001011x (x = 0 for write and x = 1 for read) |
|  | I2C3_SCL pin | Input/output | PA8 pin: clock line is used in open-drain no pull mode. |
|  | I2C3_SDA pin | Input/output | PB4 pin: data line is used in open-drain no pull mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I2C4 | I2C4 | Enabled | The I2C4 configuration is: I2C speed: up to 1 MHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b1001011x (x = 0 for write and x = 1 for read) |
|  | I2C4_SCL pin | Input/output | PB15 pin: clock line is used in open-drain no pull mode. |
|  | I2C4_SDA pin | Input/output | PB14 pin: data line is used in open-drain no pull mode. |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB, speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in push-pull, pull-down mode. |
| SPI3 | SPI3 | Enabled | The SPI3 configuration is: Slave mode Full Duplex 8-bit MSB, speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI3_MOSI pin | Input | PC12 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI3_MISO pin | Output | PC11 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI3_SCK pin | Input | PC10 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI3_NSS pin | Input | PA15 pin: slave chip select pin used in push-pull, pull-down mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI4 | SPI4 | Enabled | The SPI4 configuration is: Slave mode Full Duplex 8-bit MSB, speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI4_MOSI pin | Input | PE14 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI4_MISO pin | Output | PE13 pin: slave data output line, used in push-pull, pull-down mode |
|  | SP4_SCK pin | Input | PE12 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI4_NSS pin | Input | PE11 pin: slave chip select pin used in push-pull, pull-down mode. |
| DFU | USB | Enabled | USB OTG FS configured in forced device mode |
|  | USB_DM pin | Input/output | PA11 pin: USB DM line. Used in alternate push-pull, no pull mode. |
|  | USB_DP pin |  | PA12 pin: USB DP line. Used in alternate push-pull, no pull mode. No external pull-up resistor is required. |
| CAN2 and DFUs | TIM11 | Enabled | This timer is used to determine the value of the HSE. Once HSE frequency is determined, the system clock is configured to 60 MHz using PLL and HSE. |


The system clock is derived from the embedded internal high-speed RC for USARTx and I2Cx bootloaders. This internal clock is also used for CAN and DFU (USB FS device), but only for the selection phase. An external clock multiple of 1 MHz (between 4 and 26 MHz) is required for CAN and DFU execution after the selection phase.
*Note:**	Due to HSI deviation and since HSI is used to detect HSE value, use low rather than high** frequency** **HSE** **crystal** **values** **(low** **frequency** **values** **are** **better** **detected** **due** **to** **larger** **error margin). For example, it is better to use 8 MHz instead of 25 MHz.*




[Figure 50](#_bookmark321)* *shows the bootloader selection mechanism.

**Figure** **50.Bootloader** **V9.x** **selection** **for** **STM32F413xx/423xx**































| Disable all interrupt sources and other interfaces clocks |  |
| --- | --- |
|  |  |















MSv42229V1




The following table lists the STM32F413xx/423xx devices bootloader V9.x versions.

**Table** **88.** **STM32F413xx/423xx** **bootloader** **V9.x** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V9.0 | Initial bootloader version | After executing Go command (jump to user code) the bootloader resets AHB1ENR value to 0x0000 0000 and thus CCM RAM, when present, is not active (must be re-enabled by user code at startup) |





### Bootloader V7.x

#### Bootloader configuration

The STM32F42xxx/43xxx bootloader is activated by applying Pattern 5 (described in
[Table 2](#_bookmark7)). The following table shows the hardware resources used by this bootloader.

**Table** **89.** **STM32F42xxx/43xxx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 24 MHz using the PLL. The HSI clock source is used at startup (interface detection phase) and when USART or I2C interfaces are selected (once CAN or DFU is selected, the clock source is derived from the external crystal). |
|  |  | HSE enabled | The system clock frequency is 60 MHz. The HSE clock source is used only when the CAN or the DFU (USB FS device) interfaces are selected. The external clock must provide a frequency multiple of 1 MHz and ranging from 4 MHz to 26 MHz. |
|  |  | - | The CSS interrupt is enabled for the CAN and DFUs. Any failure (or removal) of the external clock /generates system reset. |
|  | RAM | - | 8 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 29 Kbytes, starting from address 0x1FFF0000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
|  | Power | - | Voltage range is set to [1.62 V, 2.1 V]. In this range internal flash write operations are allowed only in byte format (half-word, word, and double-word operations are not allowed). The voltage range can be configured in run time using bootloader commands. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8 bits, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in input no pull mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in input no pull mode. |
| USART3 (on PB10/PB11) | USART3 | Enabled | Once initialized, the configuration is 8 bits, even parity, and one stop bit |
|  | USART3_RX pin | Input | PB11 pin: USART3 in reception mode. Used in input pull-up mode. |
|  | USART3_TX pin | Output | PB10 pin: USART3 in transmission mode. Used in input pull-up mode. |
| USART3 (on PC10/PC11) | USART3 | Enabled | Once initialized, the configuration is 8 bits, even parity, and one stop bit |
|  | USART3_RX pin | Input | PC11 pin: USART3 in reception mode. Used in input pull-up mode. |
|  | USART3_TX pin | Output | PC10 pin: USART3 in transmission mode. Used in input pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |
| CAN2 | CAN2 | Enabled | Once initialized the CAN2 configuration is: Baudrate 125 kbps, 11-bit identifier. Note: CAN1 is clocked during CAN2 bootloader execution because CAN1 manages the communication between CAN2 and SRAM. |
|  | CAN2_RX pin | Input | PB5 pin: CAN2 in reception mode. Used in alternate push pull, pull-up mode. |
|  | CAN2_TX pin | Output | PB13 pin: CAN2 in transmission mode. Used in alternate push pull, pull-up mode. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 400 kHz, 7-bit address, Slave mode, Analog filter ON Target 7-bit address: 0b0111000x (x = 0 for write and x = 1 for read). |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin | Input/output | PB9 pin: data line is used in open-drain no pull mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| DFU | USB | Enabled | USB OTG FS configured in forced device mode |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in alternate push pull no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in alternate push pull no pull mode. No external pull-up resistor is required |
| CAN2 and DFUs | TIM11 | Enabled | This timer is used to determine the value of the HSE. Once the HSE frequency is determined, the system clock is configured to 60 MHz using PLL and HSE. |


The system clock is derived from the embedded internal high-speed RC for USARTx and I2Cx bootloaders. This internal clock is also used for CAN and DFU (USB FS device), but only for the selection phase. An external clock multiple of 1 MHz (between 4 and 26 MHz) is required for CAN and DFU execution after the selection phase.
*Note:**	Due to HSI deviation and since HSI is used to detect HSE value, use low rather than high** frequency** **HSE** **crystal** **values** **(low** **frequency** **values** **are** **better** **detected** **due** **to** **larger** **error margin). For example, it is better to use 8 MHz instead of 25 MHz.*


#### Bootloader selection

[Figure 51](#_bookmark329)* *and [Figure 52](#_bookmark330)* *show the bootloader selection mechanism.

**Figure** **51.** **Dual** **bank** **boot** **implementation** **for** **STM32F42xxx/43xxx** **Bootloader** **V7.x**















| Set Bank Swap to Bank2 |  |
| --- | --- |
|  |  |











| Set Bank Swap to Bank1 |  |
| --- | --- |
|  |  |







1. CCM RAM is not considered valid as stack pointer address for the dual bank boot mechanism.


**Figure** **52.** **Bootloader** **V7.x** **selection** **for** **STM32F42xxx/43xxx**







| Disable all interrupt sources |  |
| --- | --- |
|  |  |


| Configure USARTx |  |
| --- | --- |
|  |  |



#### Bootloader version

The following table lists the STM32F42xxx/43xxx devices bootloader V7.x versions.

**Table** **90.** **STM32F42xxx/43xxx** **bootloader** **V7.x** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V7.0 | Initial bootloader version | For the CAN interface, the Write Unprotect command is not functional. Use Write Memory command and write directly to the option bytes to disable the write protection. For the USB DFU interface, in Dual Bank mode, the Erase operation is not functional for the second bank. Return to Single Bank mode, erase desired sector(s) and then reactivate the Dual Bank mode. After executing Go command (jump to user code) the bootloader resets AHB1ENR value to 0x0000 0000 and thus CCM RAM, when present, is not active (must be re-enabled by user code at startup). |


### Bootloader V9.x

#### Bootloader configuration

The STM32F42xxx/43xxx bootloader is activated by applying Pattern 5 (described in
[Table 2](#_bookmark7)). The following table shows the hardware resources used by this bootloader.

**Table** **91.** **STM32F42xxx/43xxx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 60 MHz using the PLL. The HSI clock source is used at startup (interface detection phase) and when USART or SPI or I2C interfaces are selected (once CAN or DFU is selected, the clock source is derived from the external crystal). |
|  |  | HSE enabled | The system clock frequency is 60 MHz. The HSE clock source is used only when the CAN or the DFU (USB FS device) interfaces are selected. The external clock must provide a frequency multiple of 1 MHz and ranging from 4 MHz to 26 MHz. |
|  |  | - | The CSS interrupt is enabled for the CAN and DFUs. Any failure (or removal) of the external clock generates system reset. |
|  | RAM | - | 12 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 29 Kbytes, starting from address 0x1FFF0000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
|  | Power | - | Voltage range is set to [1.62 V, 2.1 V]. In this range internal flash write operations are allowed only in byte format (half-word, word, and double-word operations are not allowed). The voltage range can be configured in run time using bootloader commands. |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in input no pull mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in input no pull mode. |



**Table** **91.** **STM32F42xxx/43xxx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| USART3 (on PB10/PB11) | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PB11 pin: USART3 in reception mode. Used in input pull-up mode. |
|  | USART3_TX pin | Output | PB10 pin: USART3 in transmission mode. Used in input pull-up mode. |
| USART3 (on PC10/PC11) | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit. |
|  | USART3_RX pin | Input | PC11 pin: USART3 in reception mode. |
|  | USART3_TX pin | Output | PC10 pin: USART3 in transmission mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |
| CAN2 | CAN2 | Enabled | Once initialized the CAN2 configuration is: Baudrate 125 kbps, 11-bit identifier. Note: CAN1 is clocked during CAN2 bootloader execution because CAN1 manages the communication between CAN2 and SRAM. |
|  | CAN2_RX pin | Input | PB5 pin: CAN2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | CAN2_TX pin | Output | PB13 pin: CAN2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 400 kHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b0111000x (x = 0 for write and x = 1 for read). |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain mode. |
|  | I2C1_SDA pin | Input/output | PB9 pin: data line is used in open-drain mode. |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 400 kHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b0111000x (x = 0 for write and x = 1 for read). |
|  | I2C2_SCL pin | Input/output | PF1 pin: clock line is used in open-drain mode. |
|  | I2C2_SDA pin | Input/output | PF0 pin: data line is used in open-drain mode. |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 400 kHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b0111000x (x = 0 for write and x = 1 for read). |
|  | I2C3_SCL pin | Input/output | PA8 pin: clock line is used in open-drain mode. |
|  | I2C3_SDA pin | Input/output | PC9 pin: data line is used in open-drain mode. |



**Table** **91.** **STM32F42xxx/43xxx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode, Full Duplex, -bit MSB, Speed up to 8 MHz, Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in push-pull, pull-down mode. |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode, Full Duplex, 8-bit MSB, Speed up to 8 MHz, Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PI3 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI2_MISO pin | Output | PI2 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI2_SCK pin | Input | PI1 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI2_NSS pin | Input | PI0 pin: slave chip select pin used in push-pull, pull-down mode. |
| SPI4 | SPI4 | Enabled | The SPI4 configuration is: Slave mode, Full Duplex, 8-bit MSB, Speed up to 8 MHz, Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI4_MOSI pin | Input | PE14 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI4_MISO pin | Output | PE13 pin: slave data output line, used in push-pull, pull-down mode |
|  | SP4_SCK pin | Input | PE12 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI4_NSS pin | Input | PE11 pin: slave chip select pin used in push-pull, pull-down mode. |
| DFU | USB | Enabled | USB OTG FS configured in forced device mode |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in alternate push-pull no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in alternate push-pull no pull mode. No external pull-up resistor is required |
| CAN2 and DFUs | TIM11 | Enabled | This timer is used to determine the value of the HSE. Once the HSE frequency is determined, the system clock is configured to 60 MHz using PLL and HSE. |



The system clock is derived from the embedded internal high-speed RC for USARTx, I2Cx I2Cx, and SPIx bootloaders. This internal clock is also used for CAN and DFU (USB FS device), but only for the selection phase. An external clock multiple of 1 MHz (between 4 and 26 MHz) is required for CAN and DFU execution after the selection phase.
*Note:**	Due to HSI deviation and since HSI is used to detect HSE value, use low rather than high** frequency** **HSE** **crystal** **values** **(low** **frequency** **values** **are** **better** **detected** **due** **to** **larger** **error margin). For example, it is better to use 8 MHz instead of 25 MHz.*


#### Bootloader selection

[Figure 53](#_bookmark337)* *and [Figure 54](#_bookmark338)* *show the bootloader selection mechanism.

**Figure** **53.** **Dual** **bank** **boot** **implementation** **for** **STM32F42xxx/43xxx** **bootloader** **V9.x**
















| Set Bank Swap to Bank2 |  |
| --- | --- |
|  |  |











| Set Bank Swap to Bank1 |  |
| --- | --- |
|  |  |






1. CCM RAM is not considered valid as stack pointer address for the dual bank boot mechanism.


**Figure** **54.** **Bootloader** **V9.x** **selection** **for** **STM32F42xxx/43xxx**





































| Reconfigure System clock to 60MHz and USB clock to 48 MHz |  |
| --- | --- |
|  |  |



#### Bootloader version

[Table 92](#_bookmark340)* *lists the STM32F42xxx/43xxx devices bootloader V9.x versions.

**Table** **92.** **STM32F42xxx/43xxx** **bootloader** **V9.x** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V9.0 | This bootloader is an updated version of bootloader v7.0. This new version of bootloader supports I2C2, I2C3, SPI1, SPI2, and SPI4 interfaces. The RAM used by this bootloader is increased from 8 Kb to 12 Kb. The ID of this bootloader is 0x90 The connection time is increased. | For the USB DFU interface, in Dual Bank mode, the Erase operation is not functional for the second bank. Return to Single Bank mode, erase desired sector(s) and then reactivate the Dual Bank mode. After executing Go command (jump to user code) the bootloader resets AHB1ENR value to 0x0000 0000 and thus CCM RAM, when present, is not active (must be re-enabled by user code at startup) |
| V9.1 | This bootloader is an updated version of bootloader v9.0. This new version implements the new I2C No-stretch commands (I2C protocol v1.1) and the capability of disabling PcROP when RDP1 is enabled with ReadOutUnprotect command for all protocols(USB, USART, CAN, I2C and SPI). The ID of this bootloader is 0x91 | For the CAN interface, the Write Unprotect command is not functional. Use Write Memory command and write directly to the option bytes in order to disable the write protection. For the USB DFU interface, in Dual Bank mode, the Erase operation is not functional for the second bank. Return to Single Bank mode, erase desired sector(s) and then reactivate the Dual Bank mode. After executing Go command (jump to user code) the bootloader resets AHB1ENR value to 0x0000 0000 and thus CCM RAM, when present, is not active (must be re-enabled by user code at startup) |


## STM32F446xx devices


### Bootloader configuration

The STM32F446xx bootloader is activated by applying Pattern 1 (described in [Table 2](#_bookmark7)). The following table shows the hardware resources used by this bootloader.

**Table** **93.STM32F446xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
|  |  | HSI enabled | The HSI is used at startup as clock source for system clock configured to 60 MHz and for USART, I2C and SPI bootloader operation. |
|  | RCC | HSE enabled | The HSE is used only when the CAN or the DFU (USB FS device) interfaces are selected. In this case the system clock configured to 60 MHz with HSE as clock source. |
|  |  |  | The HSE frequency must be multiple of 1 MHz and ranging from 4 MHz to 26 MHz. |
|  |  | - | The CSS interrupt is enabled for the CAN and DFUs. Any failure (or removal) of the external clock generates system reset. |
| Common to all | RAM | - | 12 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  |  |  |  |
|  | System memory | - | 29 Kbytes, starting from address 0x1FFF0000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
|  |  |  | The voltage range is [1.71 V, 3.6 V]. |
|  |  |  | In this range: |
|  |  |  | - Flash wait states: 3. |
|  | Power | - | System Clock 60 MHz. Prefetch disabled. |
|  |  |  | - Flash write operation by byte (refer to |
|  |  |  | section bootloader memory management |
|  |  |  | for more information). |



**Table** **93.STM32F446xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in input no pull mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in input no pull mode. |
| USART3 (on PB10/PB11) | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PB11 pin: USART3 in reception mode. Used in input pull-up mode. |
|  | USART3_TX pin | Output | PB10 pin: USART3 in transmission mode. Used in input pull-up mode. |
| USART3 (on PC10/PC11) | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PC11 pin: USART3 in reception mode. Used in input pull-up mode |
|  | USART3_TX pin | Output | PC10 pin: USART3 in transmission mode. Used in input pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |
| CAN2 | CAN2 | Enabled | Once initialized the CAN2 configuration is: Baudrate 125 kbps, 11-bit identifier. Note: CAN1 is clocked during CAN2 bootloader execution because in CAN1 manages the communication between CAN2 and SRAM. |
|  | CAN2_RX pin | Input | PB5 pin: CAN2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | CAN2_TX pin | Output | PB13 pin: CAN2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 400 kHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b0111100x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin | Input/output | PB9 pin: data line is used in open-drain no pull mode. |



**Table** **93.STM32F446xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 400 kHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b0111100x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PF1 pin: clock line is used in open-drain no pull mode. |
|  | I2C2_SDA pin | Input/output | PF0 pin: data line is used in open-drain no pull mode. |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 400 kHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b0111100x (x = 0 for write and x = 1 for read) |
|  | I2C3_SCL pin | Input/output | PA8 pin: clock line is used in open-drain no pull mode. |
|  | I2C3_SDA pin | Input/output | PC9 pin: data line is used in open-drain no pull mode. |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode, Full Duplex, 8-bit MSB, Speed up to 8 MHz, Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in push-pull, pull-down mode. |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode, Full Duplex, 8-bit MSB, Speed up to 8 MHz, Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PB15 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI2_MISO pin | Output | PB14 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI2_SCK pin | Input | PC7 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI2_NSS pin | Input | PB12 pin: slave chip select pin used in push-pull, pull-down mode. |



**Table** **93.STM32F446xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI4 | SPI4 | Enabled | The SPI4 configuration is: Slave mode, Full Duplex, 8-bit MSB, Speed up to 8 MHz, Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI4_MOSI pin | Input | PE14 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI4_MISO pin | Output | PE13 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI4_SCK pin | Input | PE12 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI4_NSS pin | Input | PE11 pin: slave chip select pin used in push-pull, pull-down mode. |
| DFU | USB | Enabled | USB OTG FS configured in forced device mode |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in alternate push-pull, no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in alternate push-pull, no pull mode. No external pull-up resistor is required |
| CAN2 and DFUs | TIM17 | Enabled | This timer is used to determine the value of the HSE. Once the HSE frequency is determinated, the system clock is configured to 60 MHz using PLL and HSE. |


The system clock is derived from the embedded internal high-speed RC for USARTx and I2Cx bootloaders. This internal clock is also used for CAN and DFU (USB FS device), but only for the selection phase. An external clock multiple of 1 MHz (between 4 and 26 MHz) is required for CAN and DFU execution after the selection phase.
*Note:**	Due to HSI deviation and since HSI is used to detect HSE value, use low rather than high** frequency** **HSE** **crystal** **values** **(low** **frequency** **values** **are** **better** **detected** **due** **to** **larger** **error margin). For example, it is better to use 8 MHz instead of 25 MHz.*

### Bootloader selection

[Figure 55](#_bookmark345)* *shows the bootloader selection mechanism.

**Figure** **55.Bootloader** **V9.x** **selection** **for** **STM32F446xx**

### Bootloader version

The following table lists the STM32F446xx devices bootloader V9.x versions:

**Table** **94.** **STM32F446xx** **bootloader** **V9.x** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V9.0 | Initial bootloader version | After executing Go command (jump to user code) the bootloader resets AHB1ENR value to 0x0000 0000 and thus CCM RAM, when present, is not active (must be re-enabled by user code at startup) |





### Bootloader configuration

The STM32F469xx/479xx bootloader is activated by applying Pattern 5 (described in
[Table 2](#_bookmark7)). [Table 95](#_bookmark350)* *shows the hardware resources used by this bootloader.

**Table** **95.** **STM32F469xx/479xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 60 MHz using the PLL. The HSI clock source is used at startup (interface detection phase) and when USART or SPI or I2C interfaces are selected (once CAN or DFU is selected, the clock source is derived from external crystal). |
|  |  | HSE enabled | The system clock frequency is 60 MHz. The HSE clock source is used only when the CAN or the DFU (USB FS device) interfaces are selected. The external clock must provide a frequency multiple of 1 MHz and ranging from 4 MHz to 26 MHz. |
|  |  | - | The CSS interrupt is enabled for the CAN and DFUs. Any failure (or removal) of the external clock generates system reset. |
|  | RAM | - | 12 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 29 Kbytes, starting from address 0x1FFF0000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
|  | Power | - | Voltage range is set to [1.62 V, 2.1 V]. In this range internal flash write operations are allowed only in byte format (half-word, word, and double-word operations are not allowed). The voltage range can be configured in run time using bootloader commands. |



**Table** **95.** **STM32F469xx/479xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in input no pull mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in input no pull mode. |
| USART3 (on PB10/PB11) | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PB11 pin: USART3 in reception mode. |
|  | USART3_TX pin | Output | PB10 pin: USART3 in transmission mode. Used in input pull-up mode. |
| USART3 (on PC10/PC11) | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PC11 pin: USART3 in reception mode. Used in input pull-up mode. |
|  | USART3_TX pin | Output | PC10 pin: USART3 in transmission mode. Used in input pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |
| CAN2 | CAN2 | Enabled | Once initialized the CAN2 configuration is: Baudrate 125 kbps, 11-bit identifier. Note: CAN1 is clocked during CAN2 bootloader execution because CAN1 manages the communication between CAN2 and SRAM. |
|  | CAN2_RX pin | Input | PB05 pin: CAN2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | CAN2_TX pin | Output | PB13 pin: CAN2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1000100x (x = 0 for write and x = 1 for read). |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin | Input/output | PB9 pin: data line is used in open-drain no pull mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 400 kHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b1000100x (x = 0 for write and x = 1 for read). |
|  | I2C2_SCL pin | Input/output | PF0 pin: clock line is used in open-drain no pull mode. |
|  | I2C2_SDA pin | Input/output | PF1 pin: data line is used in open-drain no pull mode. |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 400 kHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b1000100x (x = 0 for write and x = 1 for read). |
|  | I2C3_SCL pin | Input/output | PA8 pin: clock line is used in open-drain no pull mode. |
|  | I2C3_SDA pin | Input/output | PC9 pin: data line is used in open-drain no pull mode. |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode, Full Duplex, 8-bit MSB, Speed up to 8 MHz, Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in push-pull, pull-down mode. |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode, Full Duplex, 8-bit MSB, Speed up to 8 MHz, Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PI3 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI2_MISO pin | Output | PI2 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI2_SCK pin | Input | PI1pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI2_NSS pin | Input | PI0 pin: slave chip select pin used in push-pull, pull-down mode. |



**Table** **95.** **STM32F469xx/479xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI4 | SPI4 | Enabled | The SPI4 configuration is: Slave mode, Full Duplex, 8-bit MSB, Speed up to 8 MHz, Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI4_MOSI pin | Input | PE14 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI4_MISO pin | Output | PE13 pin: slave data output line, used in push-pull, pull-down mode |
|  | SP4_SCK pin | Input | PE12 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI4_NSS pin | Input | PE11 pin: slave chip select pin used in push-pull, pull-down mode. |
| DFU | USB | Enabled | USB OTG FS configured in forced device mode. USB_OTG_FS interrupt vector is enabled and used for USB DFU communications. |
|  | USB_DM pin | Input/output | PA11 pin: USB DM line. Used in alternate push-pull, no pull mode. |
|  | USB_DP pin |  | PA12 pin: USB DP line. Used in alternate push-pull, no pull mode. No external pull-up resistor is required. |


The system clock is derived from the embedded internal high-speed RC for USARTx and I2Cx bootloaders. This internal clock is also used for CAN and DFU (USB FS device), but only for the selection phase. An external clock multiple of 1 MHz (between 4 and 48 MHz) is required for CAN and DFUs execution after the selection phase.
*Note:**	Due to HSI deviation and since HSI is used to detect HSE value, use low rather than high** frequency** **HSE** **crystal** **values** **(low** **frequency** **values** **are** **better** **detected** **due** **to** **larger** **error margin). For example, it is better to use 8 MHz instead of 25 MHz.*

### Bootloader selection

[Figure 56](#_bookmark352)* *and [Figure 57](#_bookmark353)* *show the bootloader selection mechanism.

**Figure** **56.** **Dual** **bank** **boot** **implementation** **for** **STM32F469xx/479xx** **Bootloader** **V9.x**













| Set Bank Swap to Bank2 |  |
| --- | --- |
|  |  |







		


**Figure** **57.Bootloader** **V9.x** **selection** **for** **STM32F469xx/479xx**

Bootloader


System Init (Clock, GPIOs, IWDG, SysTick)

Configure I2Cx


Configure SPIx


---

Execute BL_SPI_Loop for SPIx


---

Execute BL_I2C_Loop for I2Cx



0x7F received on USARTx


---


yes



no


I2C Address Detected


---


yes




no



Synchro mechanism detected on SPIx



no



Frame detected on CANx



no


USB cable Detected


---






yes









yes







yes


---





HSE detected	no


yes

| Disable other interfaces clocks |  |
| --- | --- |
|  |  |



Execute DFU bootloader using USB interrupts


---



no	HSE detected


yes

| Disable all interrupt sources and other interfaces clocks |  |
| --- | --- |
|  |  |

Reconfigure System clock to 60MHz


Configure CAN




no
MSv38430V2

### Bootloader version

[Table 96](#_bookmark355)* *lists the STM32F469xx/479xx devices V9.x bootloader versions:

**Table** **96.**	**STM32F469xx/479xx** **bootloader** **V9.x** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V9.0 | Initial bootloader version | After executing Go command (jump to user code) the bootloader resets AHB1ENR value to 0x0000 0000 and thus CCM RAM, when present, is not active (must be re-enabled by user code at startup). |


## STM32F72xxx/73xxx devices


### Bootloader configuration

The STM32F72xxx/73xxx bootloader is activated by applying Pattern 8 (described in
[Table 2](#_bookmark7)). [Table 97](#_bookmark358)* *shows the hardware resources used by this bootloader.

**Table** **97.** **STM32F72xxx/73xxx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The HSI is used at startup as clock source for system clock configured to 60 MHz and for USART and I2C bootloader operation. |
|  |  | HSE enabled | The HSE is used only when the CAN or the DFU (USB FS device) interfaces are selected. In this case the system clock configured to 60 MHz with HSE as clock source. The HSE frequency must be a multiple of 1 MHz. ranging from 4 to 26 MHz. |
|  |  | - | The CSS interrupt is enabled for the CAN and DFUs. Any failure (or removal) of the external clock generates system reset. |
|  | RAM | - | 16 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 59 Kbytes, starting from address 0x1FF00000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
|  | Power | - | The voltage range is [1.8V, 3.6V] In this range: Flash wait states: 3. System clock frequency 60 MHz. ART Accelerator enabled. Flash write operation by byte (refer to bootloader memory management section for more information). |



**Table** **97.** **STM32F72xxx/73xxx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in input no pull mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in input no pull mode. |
| USART3 (on PB11/PB10) | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PB11 pin: USART3 in reception mode. Used in input pull-up mode. |
|  | USART3_TX pin | Output | PB10 pin: USART3 in transmission mode. Used in input pull-up mode. |
| USART3 (on PC11/PC10) | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PC11 pin: USART3 in reception mode. Used in input pull-up mode. |
|  | USART3_TX pin | Output | PC10 pin: USART3 in transmission mode. Used in input pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |
| CAN1 | CAN1 | Enabled | Once initialized the CAN1 configuration is: Baudrate 125 kbps, 11-bit identifier. |
|  | CAN1_RX pin | Input | PD0 pin: CAN1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | CAN1_TX pin | Output | PD1 pin: CAN1 in transmission mode. Used in alternate push-pull, pull-up mode. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 400 kHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b1001001x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin | Input/output | PB9 pin: data line is used in open-drain no pull mode. |



**Table** **97.** **STM32F72xxx/73xxx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 400 kHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b1001101x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PF1 pin: clock line is used in open-drain no pull mode. |
|  | I2C2_SDA pin | Input/output | PF0 pin: data line is used in open-drain no pull mode. |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 400 kHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b1001001x (x = 0 for write and x = 1 for read) |
|  | I2C3_SCL pin | Input/output | PA8 pin: clock line is used in open-drain no pull mode. |
|  | I2C3_SDA pin | Input/output | PC9 pin: data line is used in open-drain no pull mode. |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode, Full Duplex, 8-bit MSB, Speed up to 8 MHz, Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in push-pull, pull-down mode. |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode, Full Duplex, 8-bit MSB, Speed up to 8 MHz, Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PI3 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI2_MISO pin | Output | PI2 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI2_SCK pin | Input | PI1 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI2_NSS pin | Input | PI0 pin: slave chip select pin used in push-pull, pull-down mode. |



**Table** **97.** **STM32F72xxx/73xxx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI4 | SPI4 | Enabled | The SPI4 configuration is: Slave mode, Full Duplex, 8-bit MSB, Speed up to 8 MHz, Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI4_MOSI pin | Input | PE14 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI4_MISO pin | Output | PE13 pin: slave data output line, used in push-pull, pull-down mode |
|  | SP4_SCK pin | Input | PE12 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI4_NSS pin | Input | PE11 pin: slave chip select pin used in push-pull, pull-down mode. |
| DFU | USB | Enabled | USB OTG FS configured in forced device mode |
|  | USB_DM pin | Input/output | PA11 pin: USB DM line. Used in alternate push-pull, no pull mode. |
|  | USB_DP pin |  | PA12 pin: USB DP line. Used in alternate push-pull, no pull mode. No external pull-up resistor is required. |
| CAN1 and DFUs | TIM11 | Enabled | This timer is used to determine the value of the HSE. Once HSE frequency is determined, the system clock is configured to 60 MHz using PLL and HSE. |


The system clock is derived from the embedded internal high-speed RC for USARTx and I2Cx bootloaders. This internal clock is also used for CAN and DFU (USB FS device), but only for the selection phase. An external clock multiple of 1 MHz (between 4 and 26 MHz) is required for CAN and DFU execution after the selection phase.
*Note:**	Due to HSI deviation and since HSI is used to detect HSE value, use low rather than high** frequency** **HSE** **crystal** **values** **(low** **frequency** **values** **are** **better** **detected** **due** **to** **larger** **error margin). For example, it is better to use 8 MHz instead of 25 MHz.*

### Bootloader selection

[Figure 58](#_bookmark360)* *shows the bootloader selection mechanism.

**Figure** **58.** **Bootloader** **V9.x** **selection** **for** **STM32F72xxx/73xxx**
































| LVDEOH DOO LQWHUUXSW VRXUFHV DQG RWKHU LQWHUIDFHV FORFNV |  |
| --- | --- |
|  |  |





















06Y4480?91

### Bootloader version

[Table 98](#_bookmark362)* *lists the STM32F72xxx/73xxx devices bootloader V9.x versions.

**Table** **98.**	**STM32F72xxx/73xxx** **bootloader** **V9.x** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V9.0 | Initial bootloader version | At high UART baudrates (115200 bps) connection may fail due to software jitter leading to wrong baudrate calculation. In that case bootloader may respond with a baudrate up to ± 5% different from host baudrate. Workaround: use baudrates lower than 57600 bps if host tolerance to baudrate error is lower than ± 5% |






Two bootloader versions are available:
    - V7.x supporting USART1, USART3, CAN2, I2C1, I2C2, I2C3, and DFU (USB FS
device). This version is embedded in STM32F74xxx/75xxx rev. A devices.
    - V9.x supporting USART1, USART3, CAN2, I2C1, I2C2, I2C3, SPI1, SPI2, SPI4, and
DFU (USB FS device). This version is embedded in STM32F74xxx/75xxx rev. Z and rev. 1 devices.
*Note:**	When** **readout** **protection** **Level2** **is** **activated,** **STM32F74xxx/75xxx** **devices** **can** **boot** **also** **on** system memory and all commands are not accessible except Get, GetID, and GetVersion.*

### Bootloader V7.x

#### Bootloader configuration

The STM32F74xxx/75xxx bootloader is activated by applying Pattern 8 (described in
[Table 2](#_bookmark7)). [Table 99](#_bookmark366)* *shows the hardware resources used by this bootloader.

**Table** **99.** **STM32F74xxx/75xxx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The HSI is used at startup as clock source for system clock configured to 60 MHz and for USART and I2C bootloader operation. |
|  |  | HSE enabled | The HSE is used only when the CAN or the DFU (USB FS device) interfaces are selected. In this case the system clock configured to 60 MHz with HSE as clock source. The HSE frequency must be multiple of 1 MHz and ranging from 4 to 26 MHz. |
|  |  | - | The CSS interrupt is enabled for the CAN and DFUs. Any failure (or removal) of the external clock generates system reset. |
|  | RAM | - | 16 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 60 Kbytes, starting from address 0x1FF00000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
|  | Power | - | The voltage range is [1.8V, 3.6V]. In this range: Flash wait states: 3. System clock frequency 60 MHz. ART Accelerator enabled. Flash write operation by byte (refer to bootloader memory management section for more information). |



**Table** **99.** **STM32F74xxx/75xxx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in input no pull mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in input no pull mode. |
| USART3 (on PB10/PB11) | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PB11 pin: USART3 in reception mode. Used in input pull-up mode. |
|  | USART3_TX pin | Output | PB10 pin: USART3 in transmission mode. Used in input pull-up mode. |
| USART3 (on PC10/PC11) | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PC11 pin: USART3 in reception mode. Used in input pull-up mode. |
|  | USART3_TX pin | Output | PC10 pin: USART3 in transmission mode. Used in input pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |
| CAN2 | CAN2 | Enabled | Once initialized the CAN2 configuration is: Baudrate 125 kbps, 11-bit identifier. Note: CAN1 is clocked during CAN2 bootloader execution because CAN1 manages the communication between CAN2 and SRAM. |
|  | CAN2_RX pin | Input | PB5 pin: CAN2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | CAN2_TX pin | Output | PB13 pin: CAN2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 400 kHz 7-bit address, Target mode Analog filter ON Target 7-bit address: 0b1000101x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin | Input/output | PB9 pin: data line is used in open-drain no pull mode. |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 400 kHz 7-bit address, Target mode Analog filter ON Target 7-bit address: 0b1000101x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PF1 pin: clock line is used in open-drain no pull mode. |
|  | I2C2_SDA pin | Input/output | PF0 pin: data line is used in open-drain no pull mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode, Analog filter ON Target 7-bit address: 0b1000101x (x = 0 for write and x = 1 for read) |
|  | I2C3_SCL pin | Input/output | PA8 pin: clock line is used in open-drain no pull mode. |
|  | I2C3_SDA pin | Input/output | PC9 pin: data line is used in open-drain no pull mode. |
| DFU | USB | Enabled | USB OTG FS configured in forced device mode. |
|  | USB_DM pin | Input/output | PA11 pin: USB DM line. Used in alternate push-pull, no pull mode. |
|  | USB_DP pin |  | PA12 pin: USB DP line. Used in alternate push-pull, no pull mode. No external pull-up resistor is required. |
| CAN2 and DFUs | TIM11 | Enabled | This timer is used to determine the value of the HSE. Once HSE frequency is determined, the system clock is configured to 60 MHz using PLL and HSE. |


The system clock is derived from the embedded internal high-speed RC for USARTx and I2Cx bootloaders. This internal clock is also used for CAN and DFU (USB FS device), but only for the selection phase. An external clock multiple of 1 MHz (between 4 and 26 MHz) is required for CAN and DFU execution after the selection phase.
*Note:**	Due to HSI deviation and since HSI is used to detect HSE value, use low rather than high** frequency** **HSE** **crystal** **values** **(low** **frequency** **values** **are** **better** **detected** **due** **to** **larger** **error margin). For example, it is better to use 8 MHz instead of 25 MHz.*


#### Bootloader selection

**Figure** **59.Bootloader** **V7.x** **selection** **for** **STM32F74xxx/75xxx**























| Disable all interrupt sources and other interfaces clocks |  |
| --- | --- |
|  |  |


| Reconfigure System clock to 60MHz |  |
| --- | --- |
|  |  |










#### Bootloader version


**Table** **100.** **STM32F74xxx/75xxx** **bootloader** **V7.x** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V7.0 | Initial bootloader version | At high UART baudrates (115200 bps) connection may fail due to software jitter leading to wrong baudrate calculation. In that case bootloader may respond with a baudrate up to ± 5% different from host baudrate. Workaround: use baudrates lower than 57600 bps if host tolerance to baudrate error is lower than ± 5% |





#### Bootloader configuration

The STM32F74xxx/75xxx bootloader is activated by applying Pattern 8 (described in
[Table 2](#_bookmark7)). The following table shows the hardware resources used by this bootloader.

**Table** **101.** **STM32F74xxx/75xxx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The HSI is used at startup as clock source for system clock configured to 60 MHz and for USART, I2C and SPI bootloader operation. |
|  |  | HSE enabled | The HSE is used only when the CAN or the DFU (USB FS device) interfaces are selected. In this case the system clock configured to 60 MHz with HSE as clock source. The HSE frequency must be multiple of 1 MHz and ranging from 4 to 26 MHz. |
|  |  | - | The CSS interrupt is enabled for the CAN and DFU bootloaders. Any failure (or removal) of the external clock generates system reset. |
|  | RAM | - | 16 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 60 Kbytes, starting from address 0x1FF00000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
|  | Power | - | The voltage range is 1.8 V, 3.6V. In this range: Flash wait states: 3. System clock frequency 60 MHz. ART Accelerator enabled. Flash write operation by byte (refer to bootloader memory management section for more information). |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in input no pull mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in input no pull mode. |



**Table** **101.** **STM32F74xxx/75xxx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| USART3 (on PB10/PB11) | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PB11 pin: USART3 in reception mode. Used in input pull-up mode. |
|  | USART3_TX pin | Output | PB10 pin: USART3 in transmission mode. Used in input pull-up mode. |
| USART3 (on PC10/PC11) | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PC11 pin: USART3 in reception mode. Used in input pull-up mode. |
|  | USART3_TX pin | Output | PC10 pin: USART3 in transmission mode. Used in input pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |
| CAN2 | CAN2 | Enabled | Once initialized the CAN2 configuration is: Baudrate 125 kbps, 11-bit identifier. Note: CAN1 is clocked during CAN2 bootloader execution because CAN1 manages the communication between CAN2 and SRAM. |
|  | CAN2_RX pin | Input | PB5 pin: CAN2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | CAN2_TX pin | Output | PB13 pin: CAN2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1000101x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin | Input/output | PB9 pin: data line is used in open-drain no pull mode. |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1000101x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PF1 pin: clock line is used in open-drain no pull mode. |
|  | I2C2_SDA pin | Input/output | PF0 pin: data line is used in open-drain no pull mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1000101x (x = 0 for write and x = 1 for read) |
|  | I2C3_SCL pin | Input/output | PA8 pin: clock line is used in open-drain no pull mode. |
|  | I2C3_SDA pin | Input/output | PC9 pin: data line is used in open-drain no pull mode. |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in push-pull, pull-down mode. |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode, Full Duplex, 8-bit MSB, Speed up to 8 MHz, Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PI3 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI2_MISO pin | Output | PI2 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI2_SCK pin | Input | PI1 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI2_NSS pin | Input | PI0 pin: slave chip select pin used in push-pull, pull-down mode. |



**Table** **101.** **STM32F74xxx/75xxx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI4 | SPI4 | Enabled | The SPI4 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI4_MOSI pin | Input | PE14 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI4_MISO pin | Output | PE13 pin: slave data output line, used in push-pull, pull-down mode |
|  | SP4_SCK pin | Input | PE12 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI4_NSS pin | Input | PE11 pin: slave chip select pin used in push-pull, pull-down mode. |
| DFU | USB | Enabled | USB OTG FS configured in forced device mode. |
|  | USB_DM pin | Input/output | PA11 pin: USB DM line. Used in alternate push-pull, no pull mode. |
|  | USB_DP pin |  | PA12 pin: USB DP line. Used in alternate push-pull, no pull mode. No external pull-up resistor is required. |
| CAN2 and DFUs | TIM11 | Enabled | This timer is used to determine the value of the HSE. Once HSE frequency is determined, the system clock is configured to 60 MHz using PLL and HSE. |


The system clock is derived from the embedded internal high-speed RC for USARTx, I2Cx I2Cx, and SPIx bootloaders. This internal clock is also used for CAN and DFU (USB FS device), but only for the selection phase. An external clock multiple of 1 MHz (between 4 and 26 MHz) is required for CAN and DFU execution after the selection phase.
*Note:**	Due to HSI deviation and since HSI is used to detect HSE value, use low rather than high** frequency** **HSE** **crystal** **values** **(low** **frequency** **values** **are** **better** **detected** **due** **to** **larger** **error margin). For example, it is better to use 8 MHz instead of 25 MHz.*




[Figure 60](#_bookmark375)* *shows the bootloader selection mechanism.

**Figure** **60.Bootloader** **V9.x** **selection** **for** **STM32F74xxx/75xxx**


System Reset


System Init (Clock, GPIOs, IWDG, SysTick)


---


yes



yes yes




Configure SPIx



0x7F received on USARTx


---





Execute BL_SPI_Loop for SPIx


---





Execute BL_I2C_Loop for I2Cx


---

Configure USARTx

Execute BL_USART_Loop for USARTx



no

I2C Address Detected


---


yes



no


Synchro mechanism detected on SPIx


no
no

Frame detected on CANx


---


HSE detected


yes





---


no	no


---


HSE detected


yes

| Disable all interrupt sources and other interfaces clocks |  |
| --- | --- |
|  |  |

Reconfigure System clock to 60MHz



no


USB cable Detected


---





yes


---


Execute DFU bootloader using USB interrupts


---

Configure CAN






MSv36793V1


#### Bootloader version

The following table lists the STM32F74xxx/75xxx bootloader V9.x versions:

**Table** **102.** **STM32F74xxx/75xxx** **bootloader** **V9.x** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V9.0 | Initial bootloader version | At high UART baudrates (115200 bps) connection may fail due to software jitter leading to wrong baudrate calculation. In that case bootloader may respond with a baudrate up to ± 5% different from host baudrate. Workaround: use baudrates lower than 57600 bps if host tolerance to baudrate error is lower than ± 5% |





### Bootloader configuration

The STM32F76xxx/77xxx bootloader is activated by applying Pattern 9 (described in
[Table 2](#_bookmark7)). The following table shows the hardware resources used by this bootloader.

**Table** **103.** **STM32F76xxx/77xxx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The HSI is used at startup as clock source for system clock configured to 60 MHz and for USART and I2C bootloader operation. |
|  |  | HSE enabled | The HSE is used only when the CAN or the DFU (USB FS device) interfaces are selected. In this case the system clock configured to 60 MHz with HSE as clock source. The HSE frequency must be a multiple of 1 MHz, ranging from 4 to 26 MHz. |
|  |  | - | The CSS interrupt is enabled for the CAN and DFUs. Any failure (or removal) of the external clock generates system reset. |
|  | RAM | - | 16 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 59 Kbytes, starting from address 0x1FF00000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
|  | Power | - | The voltage range is [1.8 V, 3.6 V] In this range: Flash wait states: 3. System clock frequency 60 MHz. ART Accelerator enabled. Flash write operation by byte (refer to bootloader memory management section for more information). |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in input no pull mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in input no pull mode. |
| USART3 (on PB11/PB10) | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PB11 pin: USART3 in reception mode. Used in input pull-up mode. |
|  | USART3_TX pin | Output | PB10 pin: USART3 in transmission mode. Used in input pull-up mode. |



**Table** **103.** **STM32F76xxx/77xxx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| USART3 (on PC11/PC10) | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PC11 pin: USART3 in reception mode. Used in input pull-up mode. |
|  | USART3_TX pin | Output | PC10 pin: USART3 in transmission mode. Used in input pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |
| CAN2 | CAN2 | Enabled | Once initialized the CAN2 configuration is: Baudrate 125 kbps, 11-bit identifier. Note: CAN1 is clocked during CAN2 bootloader execution because CAN1 manages the communication between CAN2 and SRAM. |
|  | CAN2_RX pin | Input | PB5 pin: CAN2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | CAN2_TX pin | Output | PB13 pin: CAN2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 400 kHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b1001001x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin | Input/output | PB9 pin: data line is used in open-drain no pull mode. |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 400 kHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b1001001x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PF1 pin: clock line is used in open-drain no pull mode. |
|  | I2C2_SDA pin | Input/output | PF0 pin: data line is used in open-drain no pull mode. |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 400 kHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b1001001x (x = 0 for write and x = 1 for read) |
|  | I2C3_SCL pin | Input/output | PA8 pin: clock line is used in open-drain no pull mode. |
|  | I2C3_SDA pin | Input/output | PC9 pin: data line is used in open-drain no pull mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode, Full Duplex, 8-bit MSB, Speed up to 8 MHz, Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in push-pull, pull-down mode. |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PI3 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI2_MISO pin | Output | PI2 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI2_SCK pin | Input | PI1 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI2_NSS pin | Input | PI0 pin: slave chip select pin used in push-pull, pull-down mode. |
| SPI4 | SPI4 | Enabled | The SPI4 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI4_MOSI pin | Input | PE14 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI4_MISO pin | Output | PE13 pin: slave data output line, used in push-pull, pull-down mode |
|  | SP4_SCK pin | Input | PE12 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI4_NSS pin | Input | PE11 pin: slave chip select pin used in push-pull, pull-down mode. |



**Table** **103.** **STM32F76xxx/77xxx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| DFU | USB | Enabled | USB OTG FS configured in forced device mode |
|  | USB_DM pin | Input/output | PA11 pin: USB DM line. Used in alternate push-pull, no pull mode. |
|  | USB_DP pin |  | PA12 pin: USB DP line. Used in alternate push-pull, no pull mode. No external pull-up resistor is required. |
| CAN2 and DFUs | TIM11 | Enabled | This timer is used to determine the value of the HSE. Once HSE frequency is determined, the system clock is configured to 60 MHz using PLL and HSE. |


The system clock is derived from the embedded internal high-speed RC for USARTx and I2Cx bootloaders. This internal clock is also used for CAN and DFU (USB FS device), but only for the selection phase. An external clock multiple of 1 MHz (between 4 and 26 MHz) is required for CAN and DFU execution after the selection phase.
*Note:**	Due to HSI deviation and since HSI is used to detect HSE value, use low rather than high** frequency** **HSE** **crystal** **values** **(low** **frequency** **values** **are** **better** **detected** **due** **to** **larger** **error margin). For example, it is better to use 8 MHz instead of 25 MHz.*

### Bootloader selection

[Figure 61](#_bookmark382)* *and [Figure 62](#_bookmark383)* *show the bootloader selection mechanism.

**Figure** **61.** **Dual** **bank** **boot** **implementation** **for** **STM32F76xxx/77xxx** **Bootloader** **V9.x**
1. Only BOOT_ADD0 value is considered whatever the BOOT0 pin state, as described in [Table 104](#_bookmark385).
1. ITCM RAM is not considered valid as stack pointer address for the dual bank boot mechanism.


**Figure** **62.** **Bootloader** **V9.x** **selection** **for** **STM32F76xxx/77xxx**



























| Disable all interrupt sources and other interfaces clocks |  |
| --- | --- |
|  |  |


### Bootloader version

The following table lists the STM32F76xxx/77xxx devices bootloader V9.x versions.

**Table** **104.** **STM32F76xxx/77xxx** **bootloader** **V9.x** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V9.3 | Initial bootloader version | When the flash memory is configured to the dual bank boot mode (nDBANK=nDBOOT=0), whatever the BOOT0 Pin state only BOOT_ADD0 value is considered (when BOOT0 Pin=1, BOOT_ADD0 value is considered not the BOOT_ADD1). Workaround: to manage dual bank boot with BOOT_ADD0 only, refer to AN4826 STM32F7 series flash memory dual bank mode” At high UART baudrates (115200 bps) connection may fail due to software jitter leading to wrong baudrate calculation. In that case bootloader may respond with a baudrate up to ± 5% different from host baudrate. Workaround: use baudrates lower than 57600 bps if host tolerance to baudrate error is lower than ± 5%. Bank2 sector erase issue when using USB interface. Erasing a sector from bank2 with index (i) leads to erase sector (i+4) |





### Bootloader configuration

The STM32G03xxx/G04xxx bootloader is activated by applying Pattern 11 (described in [Table 2](#_bookmark7)). The following table shows the hardware resources used by this bootloader. Note that STM32G030x do not have BOOT_LOCK(bit), so consider that when using Pattern 11.

**Table** **105.** **STM32G03xxx/G04xxx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 24 MHz (using PLL clocked by HSI). |
|  | RAM | - | 4 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 8 Kbytes, starting from address 0x1FFF0000 |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| Securable memory area | - | - | The address to jump to for the securable memory area is 0x1FFF1D00 |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USARTx bootloader | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 1 MHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b1010110x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain pull-up mode. |
|  | I2C1_SDA pin | Input/output | PB7 pin: data line is used in open-drain pull-up mode. |



**Table** **105.** **STM32G03xxx/G04xxx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 1 MHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b1010110x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PB10 pin: clock line is used in open-drain pull-up mode. |
|  | I2C2_SDA pin | Input/output | PB11 pin: data line is used in open-drain pull-up mode. |


*Note:**	On** **SO8,** **WLCSP18,** **TSSOP20,** **and** **UFQFN28** **packages** **USART1** **PA9/PA10** **IOs** **are** remapped on PA11/PA12.*


### Bootloader selection

[Figure 63](#_bookmark390)* *shows the bootloader selection mechanism.

**Figure** **63.** **Bootloader** **V5.x** **selection** **for** **STM32G03xxx/G04xxx**




















[Table 106](#_bookmark392)* *lists the STM32G03xxx/G04xxx devices bootloader versions.

**Table** **106.** **STM32G03xxx/04xxx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V5.1 | Initial bootloader version | Supports only 48- and 32-pin packages Issue is seen for both packages, if PA3 stays to low level, system is stuck in the USART2 detection sequence and no other interface is detected. |
| V5.2 | Add support to small packages 8/20 and 28 pins | Issue is seen for all packages (except SO8, no PA3 pin), if PA3 stays to low level, system is stuck in the USART2 detection sequence and no other interface is detected. |
| V5.3 | Fix V5.2 limitations | None |
| V5.4 | Improve USART2 detection method Expose ENGI memory area Enable interrupts by resetting PRIMASK | None |


## STM32G07xxx/08xxx device bootloader


### Bootloader configuration

The STM32G07xxx/G08xxx bootloader is activated by applying Pattern 11 (described in
[Table 2](#_bookmark7)). [Table 107](#_bookmark395)* *shows the hardware resources used by this bootloader.
When using Pattern 11, consider that STM32G070xx devices do not have BOOT_LOCK(bit).

**Table** **107.** **STM32G07xxx/8xxx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 24 MHz (using PLL clocked by HSI). |
|  | RAM | - | 12 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 28 Kbytes, starting from address 0x1FFF0000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| Securable memory area | - | - | The address to jump to for the securable memory area is 0x1FFF6800 |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART3 | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PC11 pin: USART3 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART3_TX pin | Output | PC10 pin: USART3 in transmission mode. Used in alternate push-pull, pull-up mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1010001x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain pull-up mode. |
|  | I2C1_SDA pin | Input/output | PB7 pin: data line is used in open-drain pull-up mode. |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1010001x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PB10 pin: clock line is used in open-drain pull-up mode. |
|  | I2C2_SDA pin | Input/output | PB11 pin: data line is used in open-drain pull-up mode. |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, pull-down mode. |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, pull-down mode.(1) |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, pull-down mode. |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in push-pull, pull-down mode. Note: This IO can be tied to GND if the SPI master does not use it. |



**Table** **107.** **STM32G07xxx/8xxx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PB15 pin: slave data input line, used in push-pull, pull-down mode. |
|  | SPI2_MISO pin | Output | PB14 pin: slave data output line, used in push-pull, pull-down mode.(1) |
|  | SPI2_SCK pin | Input | PB13 pin: slave clock line, used in push-pull, pull-down mode. |
|  | SPI2_NSS pin | Input | PB12 pin: slave chip select pin used in push-pull, pull-down. Note: This IO can be tied to GND if the SPI master does not use it. |

1. SPI Tx (MISO) is handled by DMA. On the bootloader start-up after SPI initialization as soon as the bit DMATx enable on SPI CR2 register is set to 0x1, the MISO line is set to 3.3 V.

### Bootloader selection

[Figure 64](#_bookmark398)* *shows the bootloader selection mechanism.

**Figure** **64.** **Bootloader** **V11.0** **selection** **for** **STM32G07xxx/G08xxx**

### Bootloader version

[Table 108](#_bookmark400)* *lists the STM32G07xxx/8xxx devices bootloader versions.

**Table** **108.** **STM32G07xxx/08xxx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V11.0 | Initial bootloader version | Not supporting packages smaller than LQFP64 |
| V11.1 | Supporting all packages | None |



**Table** **108.** **STM32G07xxx/08xxx** **bootloader** **versions** **(continued)**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V11.2 | Added securable memory area feature | Option byte launch missing when using USART protocol RCC register RCC_ICSCR is not set to its default value when Go command is used. HSITRIM value is set to a value different from default. RCC registers are not set to their default value when Go command is used (HSITRIM is not correctly reset). Enabling SRAM parity check option byte causes bootloader crash if the SRAM is not initialized before enabling this feature. |
| V11.3 | Fixed V11.2 limitations and added SW enhancements | Empty check flag cleared by bootloader at boot Compatibility break on boot sequence versus older versions(1) Erase sectors not working as expected Root cause: Wrong FLITF BUSY bit check leading to not waiting for the erase operation termination. Workaround: Erase only by one sector and wait 40 ms for the erase termination before running the next operation. I2C stretches the line on the connection causing issues with some HW hosts Root cause: USART3 detection method changed compared to the V11.2: a loop is added when a low edge is detected on the RX pin as the BL SW start baudrate calculations expecting it is the begining of 0x7F byte. When the RX pin PC11 is tied to GND (manually on 64-pin packages or by production on low pin count packages), the USART3 detection loop is done on every Bootloader detection phase, causing a timeout wait when another peripheral is needed. Behavior: When connection to I2C is requested (host sends I2C address to the bootloader), the I2C HW detects the request ,but the BL SW is blocked on the USART3 SW loop, causing the I2C line stretching. Some HW hosts that do not support the stretching fail connecting with bootloader. Workaround: on 64-pin packages, do not put PC11 pin to GND. There is no workaround on low pin count packages, the only solution is to use a HW host supporting the clock stretching. |
| V11.4 | Fixed V11.3 limitations | None |

1. See [Section 48.3.1](#_bookmark401).


#### Compatibility break on boot sequence

Some enhancements introduced in V11.3 break the compatibility with the boot sequence of versions V11.2 and V11.1.
The major change is the addition of initialization of hardware peripherals (for the exact list refer to [Section 48.1](#_bookmark394)) used by the bootloader to their default values (as defined in RM0444).
The main impact is seen in two cases:
      1. When jumping to the bootloader from user flash, the first operation is to reset the peripherals to their default values.
      1. Usage of the “Empty check” boot mode
        - Empty check flag is raised by HW on a POR or option byte change when the user flash is empty.
        - This detection leads to boot on the bootloader.
        - As per the new boot sequence, the bootloader clears this flag.
        - Using a reset while the user flash is not yet programmed leads to a wrong boot on an empty user flash.
Avoid resets (except POR or option byte change) while the user flash is not programmed by the bootloader.

## STM32G0B0xx device bootloader


### Bootloader configuration

The STM32G0B0xx bootloader is activated by applying Pattern 11 (described in [Table 2](#_bookmark7)). The following table shows the hardware resources used by this bootloader. Note that STM32G0B0xx do not have BOOT_LOCK(bit), so consider that when using Pattern 11.

**Table** **109.** **STM32G0B0xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 60 MHz (using PLL clocked by HSI). If an external clock (HSE) is not present, the system is kept clocked from the HSI |
|  |  | HSE enabled | The external clock can be used for all bootloader interfaces and must have one of the following values [48, 32, 16, 12, 8] MHz. The PLL is used to generate 48 MHz for USB and system clock. |
|  | RAM | - | 16 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | The bootloader firmware is shared on two banks: 28 Kbytes, starting from address 0x1FFF0000 until 0x1FFF6FFF Part of the 28 KB (0x1FFF8000 – 0x1FFFEFFF) |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| Securable memory area | - | - | The address to jump to for the exit securable memory area is 0x1FFF6800 |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. |



**Table** **109.** **STM32G0B0xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| USART3 | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PC11 pin: USART3 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART3_TX pin | Output | PC10 pin: USART3 in transmission mode. Used in alternate push-pull, pull-up mode. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 1 MHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b1011101x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain pull-up mode. |
|  | I2C1_SDA pin | Input/output | PB7 pin: data line is used in open-drain pull-up mode. |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 1 MHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b1011101x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PB10 pin: clock line is used in open-drain pull-up mode. |
|  | I2C2_SDA pin | Input/output | PB11 pin: data line is used in open-drain pull-up mode. |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, pull-down mode. |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, pull-down mode.(1) |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, pull-down mode. |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in push-pull, pull-down mode. Note: This IO can be tied to GND if the SPI master does not use it. |



**Table** **109.** **STM32G0B0xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PB15 pin: slave data input line, used in push-pull, pull-down mode. |
|  | SPI2_MISO pin | Output | PB14 pin: slave data output line, used in push-pull, pull-down mode.(1) |
|  | SPI2_SCK pin | Input | PB13 pin: slave clock line, used in push-pull, pull-down mode. |
|  | SPI2_NSS pin | Input | PB12 pin: slave chip select pin used in push-pull, pull-down. Note: This IO can be tied to GND if the SPI master does not use it. |
| DFU(2) | USB | Enabled | USB FS configured in Forced Device mode. USB FS interrupt vector is enabled and used for USB DFU communications. Note: VDDUSB IO must be connected to 3.3 V as USB peripheral is used by the bootloader.‘ |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in input no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in input no pull mode. No external pull-up resistor is required |

1. SPI Tx (MISO) is handled by DMA. On the bootloader start-up after SPI initialization as soon as the bit DMATx enable on SPI CR2 register is set to 0x1, the MISO line is set to 3.3 V.
1. USB DFU is not available on LQFP32 package.

### Bootloader selection

[Figure 65](#_bookmark407)* *shows the bootloader selection mechanism.

**Figure** **65.** **Bootloader** **selection** **for** **STM32G0B0xx**


### Bootloader version

[Table 110](#_bookmark409)* *lists the STM32G0B0xx devices bootloader versions.

**Table 110. STM32G0B0xx bootloader versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V13.0 | Initial bootloader version | Erase multiple sectors not working on Bank2 Root cause: wrong BUSY bit check on Bank2 leads to generate FLITF error after one sector erase Workaround: erase only by one sector when targeting Bank2 Empty check flag cleared by error on the bootloader startup phase Root cause: on the startup phase the bootloader SW performs a system deinitialization, leading to write the default value on the FLASH_ACR register, which overrides the Empty check bit with 0 Behavior: when Empty check boot mode is used and the flash memory is empty, the MCU boots on the bootloader but the flag is cleared by the SW. If a reset is triggered, the system tries to boot on the empty flash memory, and crashes. Caution: Avoid using reset on this case. if the system crashes, an option byte change or POR is needed to reboot. |





### Bootloader configuration

The STM32G0B1xx/0C1xx bootloader is activated by applying Pattern 11 (described in
[Table 2](#_bookmark7)). The following table shows the hardware resources used by this bootloader.

**Table** **111.** **STM32G0B1xx/0C1xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 60 MHz (using PLL clocked by HSI). |
|  |  | - | CRS is enabled for the DFU to allow USB to be clocked by HSI48 48 MHz. |
|  |  | - | 20 MHz derived from the PLLQ is used for FDCAN |
|  | RAM | - | 16 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | The bootloader firmware is shared on two banks: 28 Kbytes, starting from address 0x1FFF0000 until 0x1FFF6FFF Part of the 28 KB (0x1FFF8000 – 0x1FFFEFFF) |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| Securable memory area | - | - | The address to jump to for the securable memory area is 0x1FFF6800 |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART3 | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PC11 pin: USART3 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART3_TX pin | Output | PC10 pin: USART3 in transmission mode. Used in alternate push-pull, pull-up mode. |



**Table** **111.** **STM32G0B1xx/0C1xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 1 MHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b1011101x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain pull-up mode. |
|  | I2C1_SDA pin | Input/output | PB7 pin: data line is used in open-drain pull-up mode. |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 1 MHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b1011101x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PB10 pin: clock line is used in open-drain pull-up mode. |
|  | I2C2_SDA pin | Input/output | PB11 pin: data line is used in open-drain pull-up mode. |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, pull-down mode. |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, pull-down mode.(1) |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, pull-down mode. |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in push-pull, pull-down mode. Note: This IO can be tied to GND if the SPI master does not use it. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PB15 pin: slave data input line, used in push-pull, pull-down mode. |
|  | SPI2_MISO pin | Output | PB14 pin: slave data output line, used in push-pull, pull-down mode.(1) |
|  | SPI2_SCK pin | Input | PB13 pin: slave clock line, used in push-pull, pull-down mode. |
|  | SPI2_NSS pin | Input | PB12 pin: slave chip select pin used in push-pull, pull-down. Note: This IO can be tied to GND if the SPI master does not use it. |
| DFU | USB | Enabled | USB FS configured in Forced device mode. USB FS interrupt vector is enabled and used for USB DFU communications. Note: VDDUSB IO must be connected to 3.3 V as USB peripheral is used by the bootloader.‘ |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in no pull mode. No external pull-up resistor is required |
| FDCAN | FDCAN1 | Enabled | Once initialized the FDCAN1 configuration is: Connection bit rate 250 kbit/s Data bit rate 1000 kbit/s FrameFormat = FDCAN_FRAME_FD_BRS Mode = FDCAN_MODE_NORMAL AutoRetransmission = ENABLE TransmitPause = DISABLE ProtocolException = ENABLE |
|  | FDCAN1_Rx pin | Input | PD0 pin: FDCAN1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | FDCAN1_Tx pin | Output | PD1 pin: FDCAN1 in transmission mode. Used in alternate push-pull, pull-up mode. |

1. SPI Tx (MISO) is handled by DMA. On the bootloader start-up after SPI initialization as soon as the bit DMATx enable on SPI CR2 register is set to 0x1, the MISO line is set to 3.3 V.

### Bootloader selection

[Figure 66](#_bookmark415)* *shows the bootloader selection mechanism.

**Figure** **66.** **Bootloader** **selection** **for** **STM32G0B1xx/0C1xx**

















| Disable all interrupt |  |
| --- | --- |
| sources and other |  |
| interfaces clocks |  |
|  |  |






































MS56835V1




[Table 112](#_bookmark417)* *lists the STM32G0B1xx/0C1xx devices bootloader versions.

**Table** **112.** **STM32G0B1xx/0C1xx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V9.2 | Initial bootloader version | When jumping to an application, the Go command disables the debug access port by writing a wrong value on the FLASH_ACR register (bit DBG_SWEN).  Erase multiple sectors not working on Bank2 Root cause: wrong BUSY bit check on Bank2 leads to generate FLITF error after one sector erase Workaround: erase only by one sector when targeting Bank2  Empty check flag cleared by error on the bootloader startup phase Root cause: on the startup phase the bootloader SW performs a system deinitialization, leading to write the default value on the FLASH_ACR register, which overrides the Empty check bit with 0 Behavior: when Empty check boot mode is used and the flash memory is empty, the MCU boots on the bootloader but the flag is cleared by the SW. If a reset is triggered, the system tries to boot on the empty flash memory, and crashes. Caution: Avoid using reset on this case. if the system crashes, an option byte change or POR is needed to reboot. |





### Bootloader configuration

The STM32G05xxx/061xx bootloader is activated by applying Pattern 11 (described in [Table 2](#_bookmark7)). The following table shows the hardware resources used by this bootloader. Note that STM32G050x do not have BOOT_LOCK(bit), so consider that when using Pattern 11.

**Table** **113.** **STM32G05xxx/061xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 24 MHz (using PLL clocked by HSI). |
|  | RAM | - | 4 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 8 Kbytes, starting from address 0x1FFF0000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| Securable memory area | - | - | The address to jump to for the securable memory area is 0x1FFF6800 |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. PA12 pin: remapped to PA10, as it is not available on WLCSP20, TSOPP20, and UFQFPN28 packages. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. PA11 pin: remapped to PA9, as it is not available on WLCSP20, TSOPP20, and UFQFPN28 packages. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USARTx bootloader | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USART2s. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1100010x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain pull-up mode. |
|  | I2C1_SDA pin |  | PB7 pin: data line is used in open-drain pull-up mode. |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1100010x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PB10 pin: clock line is used in open-drain pull-up mode. |
|  | I2C2_SDA pin |  | PB11 pin: data line is used in open-drain pull-up mode. |





[Figure 67](#_bookmark422)* *shows the bootloader selection mechanism.

**Figure** **67.** **Bootloader** **selection** **for** **STM32G05xxx/061xx**


























### Bootloader version

[Table 114](#_bookmark424)* *lists the STM32G05xxx/061xx devices bootloader versions.



| Version number | Description | Known limitations |
| --- | --- | --- |
| V5.0 | Initial bootloader version | USART2 SW jitter issue on detection phase |
| V5.1 | Fix V5.0 limitation | Non-stretch command not working as expected and stretching the line – Root cause: wrong BUSY check leads to not entering BUSY byte generation while waiting for the Non stretch command to complete Behavior: when running a non-stretch commands instead of receiving a BUSY byte (0x76) while command is running; the BL is stretching the line and no data are sent to the host. This is noticed only on the non-stretch erase command, as it can take few ms, and can cause an issue if the host does not support the line stretching. Workaround: patch in RAM to use the correct check |





### Bootloader configuration

The STM32G431xx/441xx bootloader is activated by applying Pattern 15 (described in
[Table 2](#_bookmark7)). The following table shows the hardware resources used by this bootloader.

**Table** **115.** **STM32G431xx/441xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 72 MHz (using the PLL clocked by HSI) |
|  |  | - | CRS is enabled for the DFU to allow USB to be clocked by HSI48 48 MHz |
|  | RAM | - | 16 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 28 Kbytes, starting from address 0x1FFF0000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| Securable memory area | - | - | The address to jump to the exit securable memory area @0x1FFF6800 |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART3 | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PC11 pin: USART3 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART3_TX pin | Output | PC10 pin: USART3 in transmission mode. Used in alternate push-pull, pull-up mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1010100x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PC4 pin: clock line is used in open-drain pull-up mode. |
|  | I2C2_SDA pin |  | PA8 pin: data line is used in open-drain pull-up mode. |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1010100x (x = 0 for write and x = 1 for read) |
|  | I2C3_SCL pin | Input/output | PC8 pin: clock line is used in open-drain pull-up mode. |
|  | I2C3_SDA pin |  | PC9 pin: data line is used in open-drain pull-up mode. |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, pull-down mode. |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, pull-down mode.(1) |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, pull-down mode. |
|  | SPI1_NSS pin |  | PA4 pin: slave chip select pin used in push-pull, pull-down mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PB15 pin: slave data input line, used in push-pull, pull-down mode. |
|  | SPI2_MISO pin | Output | PB14 pin: slave data output line, used in push-pull, pull-down mode.(1) |
|  | SPI2_SCK pin | Input | PB13 pin: slave clock line, used in push-pull, pull-down mode. |
|  | SPI2_NSS pin | Input | PB12 pin: slave chip select pin used in push-pull, pull-down mode. Note: This IO can be tied to GND if the SPI master does not use it. |
| DFU | USB | Enabled | USB FS configured in forced device mode. USB FS interrupt vector is enabled and used for USB DFU communications. |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in input no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in input no pull mode. No external pull-up resistor is required |

1. SPI Tx (MISO) is handled by DMA. On the bootloader start-up after SPI initialization as soon as the bit DMATx enable on SPI CR2 register is set to 0x1, the MISO line is set to 3.3 V.




The following figure shows the bootloader selection mechanism.

**Figure** **68.** **Bootloader** **selection** **for** **STM32G431xx/441xx**




**Table** **116.** **STM32G431xx/441xx** **bootloader** **version**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V13.3 (0xD3) | Initial bootloader version | CCSRAM not supported ENGI area not exposed |
| V13.4 (0xD4) | Fix V13.3 limitations Add CCSRAM support Add ENGI support | - |





### Bootloader configuration

The STM32G47xxx/48xxx bootloader is activated by applying Pattern 14 (described in
[Table 2](#_bookmark7)). The following table shows the hardware resources used by this bootloader.

**Table** **117.** **STM32G47xxx/48xxx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 72 MHz (using the PLL clocked by HSI) |
|  |  | - | CRS is enabled for the DFU to allow USB to be clocked by HSI48 48 MHz |
|  | RAM | - | 16 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 28 Kbytes, starting from address 0x1FFF0000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
|  |  | - |  |
| Securable memory area | - | - | The address to jump to the exit securable memory area @0x1FFF6800 |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART3 | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PC11 pin: USART3 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART3_TX pin | Output | PC10 pin: USART3 in transmission mode. Used in alternate push-pull, pull-up mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 1 MHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b1010011x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PC4 pin: clock line is used in open-drain pull-up mode. |
|  | I2C2_SDA pin | Input/output | PA8 pin: data line is used in open-drain pull-up mode. |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 1 MHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b1010011x (x = 0 for write and x = 1 for read) |
|  | I2C3_SCL pin | Input/output | PC8 pin: clock line is used in open-drain pull-up mode. |
|  | I2C3_SDA pin | Input/output | PC9 pin: data line is used in open-drain pull-up mode. |
| I2C4 | I2C4 | Enabled | The I2C4 configuration is: I2C speed: up to 1 MHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b1010011x (x = 0 for write and x = 1 for read) |
|  | I2C4_SCL pin | Input/output | PC6 pin: clock line is used in open-drain pull-up mode. |
|  | I2C4_SDA pin | Input/output | PC7 pin: data line is used in open-drain pull-up mode. |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, pull-down mode. |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, pull-down mode.(1) |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull no pull-up, pull-down mode. |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in push-pull, pull-down mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PB15 pin: slave data input line, used in push-pull, npull-down mode. |
|  | SPI2_MISO pin | Output | PB14 pin: slave data output line, used in push-pull, pull-down mode.(1) |
|  | SPI2_SCK pin | Input | PB13 pin: slave clock line, used in push-pull, n pull-down mode. |
|  | SPI2_NSS pin | Input | PB12 pin: slave chip select pin used in push-pull, pull-down mode. Note: This IO can be tied to GND if the SPI master does not use it. |
| DFU | USB | Enabled | USB FS configured in forced device mode. USB FS interrupt vector is enabled and used for USB DFU communications. Note: VDDUSB IO must be connected to 3.3 V as USB peripheral is used by the bootloader. |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in input no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in input no pull mode. No external pull-up resistor is required |

1. SPI Tx (MISO) is handled by DMA. On the bootloader start-up after SPI initialization as soon as the bit DMATx enable on SPI CR2 register is set to 0x1, the MISO line is set to 3.3 V.




The following figures show the bootloader selection mechanism.

**Figure** **69.** **Bootloader** **selection** **for** **STM32G47xxx/48xxx**






















| Set Bank Swap to Bank2 |  |
| --- | --- |
|  |  |

















### Bootloader version


**Table** **118.** **STM32G47xxx/48xxx** **bootloader** **version**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V13.3 (0xD3) | Initial bootloader version | Boot from bank2 is not working |




| Version number | Description | Known limitations |
| --- | --- | --- |
| V13.4 (0xD4) | Fix V13.3 limitations | CCSRAM/ENGI not supported |
| V13.5 (0xD5) | Fix V13.4 limitations Add CCSRAM/ENGI support | None |





### Bootloader configuration

The STM32G491xx/4A1xx bootloader is activated by applying Pattern 15 (described in
[Table 2](#_bookmark7)). The following table shows the hardware resources used by this bootloader.

**Table** **119.** **STM32G491xx/4A1xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 72 MHz (using the PLL clocked by HSI) |
|  |  | - | CRS is enabled for the DFU to allow USB to be clocked by HSI48 48 MHz |
|  | RAM | - | 16 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 28 Kbytes, starting from address 0x1FFF0000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| Securable memory area | - | - | The address to jump to the exit securable memory area @0x1FFF6800 |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART3 | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PC11 pin: USART3 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART3_TX pin | Output | PC10 pin: USART3 in transmission mode. Used in alternate push-pull, pull-up mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 1 MHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b1011111x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PC4 pin: clock line is used in open-drain pull-up mode. |
|  | I2C2_SDA pin | Input/output | PA8 pin: data line is used in open-drain pull-up mode. |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 1 MHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b1011111x (x = 0 for write and x = 1 for read) |
|  | I2C3_SCL pin | Input/output | PC8 pin: clock line is used in open-drain pull-up mode. |
|  | I2C3_SDA pin | Input/output | PC9 pin: data line is used in open-drain pull-up mode. |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, pull-down mode. |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, pull-down mode.(1) |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull no pull-up, pull-down mode. |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in push-pull, pull-down mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PB15 pin: slave data input line, used in push-pull, npull-down mode. |
|  | SPI2_MISO pin | Output | PB14 pin: slave data output line, used in push-pull, pull-down mode.(1) |
|  | SPI2_SCK pin | Input | PB13 pin: slave clock line, used in push-pull, n pull-down mode. |
|  | SPI2_NSS pin | Input | PB12 pin: slave chip select pin used in push-pull, pull-down mode. Note: This IO can be tied to GND if the SPI master does not use it. |
| DFU | USB | Enabled | USB FS configured in forced device mode. USB FS interrupt vector is enabled and used for USB DFU communications. Note: VDDUSB IO must be connected to 3.3 V as USB peripheral is used by the bootloader. |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in input no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in input no pull mode. No external pull-up resistor is required |

1. SPI Tx (MISO) is handled by DMA. On the bootloader start-up after SPI initialization, as soon as bit DMATx enable on SPI CR2 register is set to 0x1, the MISO line is set to 3.3 V.




**Figure** **71.** **Bootloader** **selection** **for** **STM32G491xx/4A1xx**




**Table** **120.** **STM32G491xx/4A1xx** **bootloader** **version**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V13.2 | Initial bootloader version | None |





### Bootloader configuration

The STM32H503xx bootloader is activated by applying Pattern 17 (described in [Table 2](#_bookmark7)). [Table 121](#_bookmark452)* *shows the hardware resources used by this bootloader.
The bootloader follows boot model V3_2 (see [Section 4.10](#_bookmark35)), so it inherits all its constraints.

**Table** **121.** **STM32H503xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 200 MHz (using PLL clocked by the HSI) |
|  |  | - | CRS is enabled for the DFU to allow USB to be clocked by HSI48 48 MHz |
|  |  | - | 20 MHz derived from the PLLQ is used for FDCAN |
|  | RAM | - | 16 Kbytes, starting from address 0x24000000, are used by the bootloader firmware |
|  | System memory | - | 35 Kbytes, starting from address 0x0BF87000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Set as input until USART1 is detected. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA15 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PA5 pin: USART2 in transmission mode. Set as input until USART2 is detected. |
| USART3 | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PA3 pin: USART3 in reception mode. Used in alternate push-pull, pull-down mode. |
|  | USART3_TX pin | Output | PA4 pin: USART3 in transmission mode. Set as input until USART3 is detected. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I2C2 | I2C2 | Enabled | The I2C1 configuration is: I2C speed: up to 1 MHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b1100111x, x = 0 for write and x = 1 for read |
|  | I2C2_SCL pin | Input/output | PB3 pin: clock line is used in open-drain. pull up mode. |
|  | I2C2_SDA pin | Input/output | PB4 pin: data line is used in open-drain, pull up mode. |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, no pull mode. |
|  | SPI1_MISO pin | Output | PA0 pin: slave data output line, used in push-pull, no pull mode. |
|  | SPI1_SCK pin | Input | PA8 pin: slave clock line, used in push-pull, no pull mode. |
|  | SPI1_NSS pin | Input | PB8 pin: slave chip select pin used in push-pull, no pull mode. |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PB1 pin: slave data input line, used in push-pull no pull mode |
|  | SPI2_MISO pin | Output | PB14 pin: slave data output line, used in push-pull, no pull mode. |
|  | SPI2_SCK pin | Input | PB10 pin: slave clock line, used in push-pull, no pull mode. |
|  | SPI2_NSS pin | Input | PB12 pin: slave chip select pin used in push-pull, no pull mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI3 | SPI3 | Enabled | The SPI3 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI3_MOSI pin | Input | PC12 pin: slave data input line, used in push-pull no pull mode |
|  | SPI3_MISO pin | Output | PC11 pin: slave data output line, used in push-pull, no pull mode. |
|  | SPI3_SCK pin | Input | PC10 pin: slave clock line, used in push-pull, no pull mode. |
|  | SPI3_NSS pin | Input | PD2 pin: slave chip select pin used in push-pull, no pull mode. |
| DFU | USB | Enabled | USB FS configured in forced device mode. USB FS interrupt vector is enabled and used for USB DFU communications. |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in alternate push-pull, no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in alternate push-pull, no pull mode. No external pull-up resistor is required |
| DFU | USB | Enabled | USB FS configured in forced device mode. USB FS interrupt vector is enabled and used for USB DFU communications. Note: VDDUSB IO must be connected to 3.3 V as USB peripheral is used by the bootloader. |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in input no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in input no pull mode. No external pull-up resistor is required |
| FDCAN | FDCAN1 | Enabled | Once initialized the FDCAN1 configuration is: Connection bit rate 250 kbit/s Data bit rate 1000 kbit/s FrameFormat = FDCAN_FRAME_FD_BRS Mode = FDCAN_MODE_NORMAL AutoRetransmission = ENABLE TransmitPause = DISABLE ProtocolException = ENABLE |
|  | FDCAN1_Rx pin | Input | PB5 pin: FDCAN1 in reception mode. Used in alternate push-pull, no pull mode. |
|  | FDCAN1_Tx pin | Output | PB15 pin: FDCAN1 in transmission mode. Used in alternate push-pull, no pull mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I3C | I3C | Enabled | Mode: target mode Aval timing:0x4E DMA Reg RX: disabled DMA Req TX: disabled Status FIFO: disabled DMA Req status: disabled DMA Req control: disabled IBI: enabled Additional data after IBI ack-ed: 1 byte IBI configuration: Mandatory Data Byte (MDB) All IT disabled except RXFNE (Receive FIFO Interrupt) The RXFNE interruption is disabled after SYNC byte detection by the bootloader. |
|  | I3C1_SCL pin | Input/output | PB6 pin: I3C1 in transmission mode. Used in alternate push-pull, no pull mode. |
|  | I3C1_SDA pin |  | PB7 pin: I3C1 in transmission mode. Used in alternate push-pull, no pull mode. |


**Table** **122.** **STM32H503xx** **special** **commands**
| Special commands supported (USART/I2C/SPI/FDCAN/I3C) Opcode - 0x50 |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Function | Sub-Opcode (2 bytes) | Number of data sent (2 bytes) | Data sent (MSB first) | Number of data received | Data received | Number of status data received (2 bytes) | Status data received |
| Change product state | 0x01 | 0x4 | Product state targeted Ex: 0x00000017 | 0x0 | NA | 0x1 | 0x0 |
| Reset | 0x02 | 0x4 | 0x0 | 0x0 | NA | 0x1 | 0x0 |


*Note:**	USB** **special** **commands** **are** **slightly** **different** **from** **the** **other** **protocols** **as** **per** **the** **USB** protocol specificities:*
    - *No** **Opcode** **is** **used,** **Sub-Opcode** **is** **used** **directly*
    - *Sub-Opcode** **is** **treated** **in** **a** **single** **byte** **and** **not** **two** **bytes*
    - *Data** **are** **sent** **on** **USB** **frame** **by** **byte** **(LSB** **first).** **No** **need** **to** **add** **number** **of** **data** **to** **transmit*
    - *Returned** **data** **and** **status** **are** **formatted** **on** **the** **USB** **native** **protocol*




**Figure** **72.** **Bootloader** **V14** **selection** **for** **STM32H503xx**






| De-Init system Configure system clock to 200 MHz with HSI and PLL |  |
| --- | --- |
|  |  |






























s



















MS57511V4




**Table** **123.** **STM32H503xx** **bootloader** **version**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V14.1 | Initial bootloader version | Bootloader crash when jumping to it with (HiDe Protection Level = 3 + product state ≥ Provisioned) |
| V14.2 | Fix known limitations Change BL system clock from 160 to 200 MHz | None |





### Bootloader configuration

The STM32H523xx/533xx bootloader is activated by applying Pattern 17 (described in
[Table 2](#_bookmark7)). [Table 124](#_bookmark460)* *shows the hardware resources used by this bootloader.
The bootloader follows boot model V3_2 (see [Section 4.10](#_bookmark35)), so it inherits all its constraints.

**Table** **124.** **STM32H523xx/533xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 200 MHz (using PLL clocked by the HSI) |
|  |  | - | CRS is enabled for the DFU to allow USB to be clocked by HSI48 48 MHz |
|  |  | - | 20 MHz derived from the PLLQ is used for FDCAN |
|  | RAM | - | 16 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 35 Kbytes, starting from address 0x0BF97000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Set as input until USART1 is detected. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Set as input until USART2 is detected. |
| USART3 | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PD9 pin: USART3 in reception mode. Used in alternate push-pull, pull-down mode. |
|  | USART3_TX pin | Output | PD8 pin: USART3 in transmission mode. Set as input until USART3 is detected. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1101110x, x = 0 for write and x = 1 for read |
|  | I2C1_SCL pin | Input/output | PB8 pin: clock line is used in open-drain. pull up mode. |
|  | I2C1_SDA pin |  | PB9 pin: data line is used in open-drain, pull up mode. |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1101110x, x = 0 for write and x = 1 for read |
|  | I2C3_SCL pin | Input/output | PA8 pin: clock line is used in open-drain. pull up mode. |
|  | I2C3_SDA pin |  | PC9 pin: used in all packages with more than 39 pins. PB4 pin: used in packages with 39 pins or fewer. The data line is used in open-drain, pull-up mode. |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, no pull mode. |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, no pull mode. |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, no pull mode. |
|  | SPI1_NSS pin |  | PA4 pin: slave chip select pin used in push-pull, no pull mode. |



**Table** **124.** **STM32H523xx/533xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PC1 pin: slave data input line, used in push-pull, no pull mode in all packages except LQFP48, UFQFN48, and WLCSP39. PB15 pin: Slave data Input line, used in push-pull, no pull mode in LQFP48, UFQFN48, and WLCSP39 packages. |
|  | SPI2_MISO pin | Output | PB14 pin: slave data output line, used in push-pull, no pull mode. |
|  | SPI2_SCK pin | Input | PB10 pin: slave clock line, used in push-pull, no pull mode. |
|  | SPI2_NSS pin |  | PB12 pin: slave chip select pin used in push-pull, no pull mode. |
| SPI3 | SPI3 | Enabled | The SPI3 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI3_MOSI pin | Input | PC12 pin: slave data input line, used in push-pull no pull mode |
|  | SPI3_MISO pin | Output | PC11 pin: slave data output line, used in push-pull, no pull mode. |
|  | SPI3_SCK pin | Input | PC10 pin: slave clock line, used in push-pull, no pull mode. |
|  | SPI3_NSS pin |  | PA15 pin: slave chip select pin used in push-pull, no pull mode. |
| DFU | USB | Enabled | USB FS configured in forced device mode. USB FS interrupt vector is enabled and used for USB DFU communications. |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in alternate push-pull, no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in alternate push-pull, no pull mode.- No external pull-up resistor is required |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| FDCAN | FDCAN2 | Enabled | Once initialized the FDCAN2 configuration is: Connection bit rate 250 kbit/s Data bit rate 1000 kbit/s FrameFormat = FDCAN_FRAME_FD_BRS Mode = FDCAN_MODE_NORMAL AutoRetransmission = ENABLE TransmitPause = DISABLE ProtocolException = ENABLE |
|  | FDCAN2_Rx pin | Input | PB5 pin: FDCAN2 in reception mode. Used in alternate push-pull, no pull mode. |
|  | FDCAN2_Tx pin | Output | PB13 pin: FDCAN2 in transmission mode. Used in alternate push-pull, no pull mode. |
| I3C | I3C1 | Enabled | Mode: target mode Aval timing:0x4E DMA Reg RX: disabled DMA Req TX: disabled Status FIFO: disabled DMA Req status: disabled DMA Req control: disabled IBI: enabled Additional data after IBI ack-ed: 1 byte IBI configuration: Mandatory Data Byte (MDB) All IT disabled except RXFNE (Receive FIFO Interrupt). The RXFNE interruption is disabled after SYNC byte detection by the bootloader. |
|  | I3C1_SCL pin | Input/output | PB6 pin: I3C1 in transmission mode. Used in alternate push-pull, no pull mode in all packages except LQFP48, UFQFN48, and WLCSP39. PB8 pin: I3C1 in transmission mode. Used in alternate push-pull, no pull mode in LQFP48, UFQFN48 and WLCSP39 packages.. |
|  | I3C1_SDA pin |  | PB7 pin: I3C1 in transmission mode. Used in alternate push-pull, no pull mode. |



**Table** **125.** **STM32H523xx/533xx** **special** **commands**
| Special commands supported (USART/I2C/SPI/FDCAN/I3C) Opcode - 0x50 |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Function | Sub-Opcode (2 bytes) | Number of data sent (2 bytes) | Data sent (MSB first) | Number of data received | Data received | Number of status data received (2 bytes) | Status data received |
| Change product state | 0x01 | 0x4 | Product state targeted Ex: 0x00000017 | 0x0 | NA | 0x1 | 0x0 |
| Reset | 0x02 | 0x4 | 0x0 | 0x0 | NA | 0x1 | 0x0 |
| Data provisioning Only when BL is on HDPL = 1 | 0x83 | 0x4 | RAM address where data to provision is written | 0x0 if success 0x4 if fail | NA if success Error code if fail | 0x1 | 0x0 |


*Note:**	USB** **special** **commands** **are** **slightly** **different** **from** **the** **other** **protocols** **as** **per** **the** **USB** protocol specificities:*
- *No** **Opcode** **is** **used,** **Sub-Opcode** **is** **used** **directly*
- *Sub-Opcode** **is** **treated** **in** **a** **single** **byte** **and** **not** **two** **bytes*
- *Data** **are** **sent** **on** **USB** **frame** **by** **byte** **(LSB** **first).** **No** **need** **to** **add** **number** **of** **data** **to** **transmit*
- *Returned** **data** **and** **status** **are** **formatted** **on** **the** **USB** **native** **protocol*




[Figure 73](#_bookmark463)* *shows the bootloader selection mechanism.

**Figure** **73.** **Bootloader** **V14** **selection** **for** **STM32H523xx/533xx**






| De-Init system Configure system clock to 200 MHz with HSI and PLL |  |
| --- | --- |
|  |  |






























s



















MS56544V2

### Bootloader version

**Table** **126.** **STM32H523xx/533xx** **bootloader** **version**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V14.0 | Initial bootloader version | PKG_ID wrongly detected when PKG_ID  0xF I2C/I3C not working on BL as wrong pinout applied |
| V14.2 | Fix known limitations | None |





### Bootloader configuration

The STM32H562xx/563xx/573xx bootloader is activated by applying Pattern 17 (described in [Table 2](#_bookmark7)). [Table 127](#_bookmark468)* *shows the hardware resources used by this bootloader.
The bootloader follows boot model V3_2 (see [Section 4.10](#_bookmark35)), so it inherits all its constraints.

**Table** **127.** **STM32H562xx/563xx/573xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 200 MHz (using PLL clocked by the HSI) |
|  |  | - | CRS is enabled for the DFU to allow USB to be clocked by HSI48 48 MHz |
|  |  | - | 20 MHz derived from the PLLQ is used for FDCAN |
|  | RAM | - | 16 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 35 Kbytes, starting from address 0x0BF97000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Set as input until USART1 is detected. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Set as input until USART2 is detected. |
| USART3 | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PD9 pin: USART3 in reception mode. Used in alternate push-pull, pull-down mode. |
|  | USART3_TX pin | Output | PD8 pin: USART3 in transmission mode. Set as input until USART3 is detected. |



**Table** **127.** **STM32H562xx/563xx/573xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1100101x, x = 0 for write and x = 1 for read |
|  | I2C3_SCL pin | Input/output | PA8 pin: clock line is used in open-drain. pull up mode. |
|  | I2C3_SDA pin | Input/output | PC9 pin: data line is used in open-drain, pull up mode. |
| I2C4 | I2C4 | Enabled | The I2C4 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1100101x, x = 0 for write and x = 1 for read |
|  | I2C4_SCL pin | Input/output | PD12 pin: clock line is used in open-drain. pull up mode. |
|  | I2C4_SDA pin | Input/output | PD13 pin: data line is used in open-drain, pull up mode. |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, no pull mode. |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, no pull mode. |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, no pull mode. |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in push-pull, no pull mode. |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PC1 pin: slave data input line, used in push, pull no pull mode |
|  | SPI2_MISO pin | Output | PB14 pin: slave data output line, used in push-pull, no pull mode. |
|  | SPI2_SCK pin | Input | PB10 pin: slave clock line, used in push-pull, no pull mode. |
|  | SPI2_NSS pin | Input | PB12 pin: slave chip select pin used in push-pull, no pull mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI3 | SPI3 | Enabled | The SPI3 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI3_MOSI pin | Input | PC12 pin: slave data input line, used in push-pull no pull mode |
|  | SPI3_MISO pin | Output | PC11 pin: slave data output line, used in push-pull, no pull mode. |
|  | SPI3_SCK pin | Input | PC10 pin: slave clock line, used in push-pull, no pull mode. |
|  | SPI3_NSS pin | Input | PA15 pin: slave chip select pin used in push-pull, no pull mode. |
| DFU | USB | Enabled | USB FS configured in forced device mode. USB FS interrupt vector is enabled and used for USB DFU communications. |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in alternate push-pull, no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in alternate push-pull, no pull mode. No external pull-up resistor is required |
| DFU | USB | Enabled | USB FS configured in forced device mode. USB FS interrupt vector is enabled and used for USB DFU communications. Note: VDDUSB IO must be connected to 3.3 V as USB peripheral is used by the bootloader. |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in input no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in input no pull mode. No external pull-up resistor is required |
| FDCAN | FDCAN2 | Enabled | Once initialized the FDCAN2 configuration is: Connection bit rate 250 kbit/s Data bit rate 1000 kbit/s FrameFormat = FDCAN_FRAME_FD_BRS Mode = FDCAN_MODE_NORMAL AutoRetransmission = ENABLE TransmitPause = DISABLE ProtocolException = ENABLE |
|  | FDCAN2_Rx pin | Input | PB5 pin: FDCAN2 in reception mode. Used in alternate push-pull, no pull mode. |
|  | FDCAN2_Tx pin | Output | PB13 pin: FDCAN2 in transmission mode. Used in alternate push-pull, no pull mode. |



**Table** **127.** **STM32H562xx/563xx/573xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I3C | I3C | Enabled | Mode: target mode Aval timing:0x4E DMA Reg RX: disabled DMA Req TX: disabled Status FIFO: disabled DMA Req status: disabled DMA Req control: disabled IBI: enabled Additional data after IBI ack-ed: 1 byte IBI configuration: Mandatory Data Byte (MDB) All IT disabled except RXFNE (Receive FIFO Interrupt) The RXFNE interruption is disabled after SYNC byte detection by the bootloader. |
|  | I3C1_SCL pin | Input/output | PB6 pin: I3C1 in transmission mode. Used in alternate push-pull, no pull mode. |
|  | I3C1_SDA pin |  | PB7 pin: I3C1 in transmission mode. Used in alternate push-pull, no pull mode. |


**Table** **128.** **STM32H562xx/563xx/573xx** **special** **commands**
| Special commands supported (USART/I2C/SPI/FDCAN/I3C) Opcode - 0x50 |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Function | Sub-Opcode (2 bytes) | Number of data sent (2 bytes) | Data sent (MSB first) | Number of data received | Data received | Number of status data received (2 bytes) | Status data received |
| Change product state | 0x01 | 0x4 | Product state targeted Ex: 0x00000017 | 0x0 | NA | 0x1 | 0x0 |
| Reset | 0x02 | 0x4 | 0x0 | 0x0 | NA | 0x1 | 0x0 |
| Data provisioning Only when BL is on HDPL = 1 | 0x83 | 0x4 | RAM address where data to provision is written | 0x0 if success 0x4 if fail | NA if success Error code if fail | 0x1 | 0x0 |


*Note:**	USB** **special** **commands** **are** **slightly** **different** **from** **the** **other** **protocols** **as** **per** **the** **USB** protocol specificities:*
    - *No** **Opcode** **is** **used,** **Sub-Opcode** **is** **used** **directly*
    - *Sub-Opcode** **is** **treated** **in** **a** **single** **byte** **and** **not** **two** **bytes*
    - *Data** **are** **sent** **on** **USB** **frame** **by** **byte** **(LSB** **first).** **No** **need** **to** **add** **number** **of** **data** **to** **transmit*
    - *Returned** **data** **and** **status** **are** **formatted** **on** **the** **USB** **native** **protocol*




[Figure 74](#_bookmark471)* *shows the bootloader selection mechanism.

**Figure** **74.** **Bootloader** **V14** **selection** **for** **STM32H562xx/563xx/573xx**






| De-Init system Configure system clock to 200 MHz with HSI and PLL |  |
| --- | --- |
|  |  |






























s



















MS57511V4

### Bootloader version


**Table** **129.** **STM32H562xx/563xx/573xx** **bootloader** **version**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V14.5 | Fix known limitations Only on 1 Mbyte devices for revisions other than W. Populated on all sales types for revision W. | None |
| V14.4 | Fix known limitations Change BL system clock from 160 to 200 MHz | EEPROM sector erase not working on 1 Mbyte devices. |
| V14.3 | Initial bootloader version | Bootloader crash when jumping to it with the following condition (TrustZone® enabled + HiDe Protection = 3 + Product state ≥ Provisioned) |


A standalone EraseEEPROM function is added on the system memory at address 0x0BF9 F500. When an erase sector is needed:
    1. Write at RAM address 0x2000 4000 (LSB to MSB)
3. Byte0: number of sectors to erase (N)
3. Byte1 to N (every byte contains the sector number, that is, 0 to 7 for Bank1, 8 to 15 for Bank2)
3. Example: to erase sector 3, 4, and 13, write 0x0303040D at address 0x20004000.
    1. After the erase, go back to the bootloader.
    1. To continue using the bootloader, a reconnect is needed.




### Bootloader configuration

The STM32H5Ex/5Fx bootloader is activated by applying Pattern17 (see [Table 2](#_bookmark7)). [Table 130](#_bookmark476)* *shows the hardware resources used by this bootloader.
The bootloader follows boot model V3_2 (see [Section 4.10](#_bookmark35)), so it inherits all its constraints.

**Table** **130.** **STM32H5Ex/5Fx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 200 MHz (with PLL). |
|  |  | HSI48 enabled if USB HS does not exist on the package | Depending on engineering values read at bootloader startup, if USB HS is not enabled, USB FS is used by the bootloader. In this case, the clock recovery system (CRS) is enabled for the DFU bootloader to allow USB to be clocked by HSI48 at 48 MHz. |
|  |  | HSE enabled if USB HS exists on the package | Depending on engineering values read at bootloader startup, if USB HS is enabled, USB HS is used by the bootloader. At startup, USB HS is clocked from HSI PLLQ, with a fixed value of 20 MHz. If a USB cable is detected on the USB HS port and enumeration is complete, USB HS stops, and HSE quartz calculation starts based on TIM17. Supported values are 8 MHz, 12 MHz, 16 MHz, 20 MHz, 24 MHz, 26 MHz, 32 MHz, and 48 MHz. If no HSE is detected or the value does not match the supported values, the system issues a reset. |
|  | RAM | - | 16 Kbytes, starting from address 0x20000000 are used by the bootloader firmware. |
|  | System memory | - | 40 Kbytes, starting from address 0x0BFAC000 contain the bootloader firmware. |
|  | IWDG | - | The independent watchdog (IWDG) prescaler is configured to its maximum value. It is periodically refreshed to prevent a watchdog reset (in case the hardware IWDG option was previously enabled by the user). |
| USART1 | USART1 | Enabled | Once initialized, the USART1 configuration is: 8 bits, even parity and 1 Stop bit. |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Kept in reset configuration until 0x7F detected on USART_RX. |



**Table** **130.** **STM32H5Ex/5Fx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/peripheral | State | Comment |
| --- | --- | --- | --- |
| USART2 | USART2 | Enabled | Once initialized the USART2 configuration is: 8 bits, even parity and 1 Stop bit. |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Kept in reset configuration until 0x7F detected on USART_RX. |
| USART3 | USART3 | Enabled | Once initialized the USART2 configuration is: 8 bits, even parity and 1 Stop bit |
|  | USART3_RX pin | Input | PD9 pin: USART3 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART3_TX pin | Output | PD8 pin: USART3 in transmission mode. Kept in reset configuration until 0x7F detected on USART_RX. |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1110100x (where x = 0 for write and x = 1 for read) |
|  | I2C3_SCL pin | Input/Output | PA8 pin: clock line is used in open-drain pull-up mode. |
|  | I2C3_SDA pin | Input/Output | PC9 pin: data line is used in open-drain pull-up mode. |
| I2C4 | I2C4 | Enabled | The I2C4 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1110100x (where x = 0 for write and x = 1 for read) |
|  | I2C4_SCL pin | Input/Output | PD12 pin: clock line is used in open-drain pull-up mode. |
|  | I2C4_SDA pin | Input/Output | PD13 pin: data line is used in open-drain pull-up mode. |




| Bootloader | Feature/peripheral | State | Comment |
| --- | --- | --- | --- |
| I3C | I3C1 | Enabled | Mode: target mode Aval timing:0x4E DMA Request RX: disabled DMA Request TX: disabled Status FIFO: disabled DMA Request status: disabled DMA Request control: disabled IBI: enabled Additional data after IBI ack-ed: 1 byte IBI configuration: mandatory data byte (MDB) All interrupts are disabled except RXFNE (Receive FIFO Interrupt). The RXFNE interrupt is disabled after SYNC byte is detected by the bootloader. |
|  | I3C1_SCL pin | Input/output | PB6 pin: I3C1 in transmission mode. Configured in alternate push-pull, pull-up, and switched to no pull mode. |
|  | I3C1_SDA pin |  | PB7 pin: I3C1 in transmission mode. Configured in alternate push-pull, pull-up, and switched to no pull mode. |
| DFU | USBFS | Enabled only if USB HS is not enabled by the engineering bytes on the package | USB FS configured in forced device mode. USB FS interrupt vector is enabled and used for USB DFU communications. |
|  | USBFS_DM pin | Input/Output | PA11: Not configured by bootloader SW. |
|  | USBFS_DP pin |  | PA12: Not configured by bootloader SW. |
|  | USBHS | Enabled - if USB HS enabled by the engineering bytes on the package | USB HS configured in forced device mode. USB HS interrupt vector is enabled and used for USB DFU communications. |
|  | USBHS_DM pin | Input/Output | No pins configured for the USB HS. |
|  | USBHS_DP pin |  |  |



**Table** **131.** **STM32H5Ex/5Fx** **special** **commands**
| Special commands supported (USART/I2C/I3C) Opcode - 0x50 |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Function | Sub-Opcode (2 bytes) | Number of data sent (2 bytes) | Data sent (MSB first) | Number of data received | Data received | Number of status data received (2 bytes) | Status data received |
| Change product state | 0x01 | 0x4 | Product state targeted Ex: 0x00000017 | 0x0 | NA | 0x1 | 0x0 |
| Reset | 0x02 | 0x4 | 0x0 | 0x0 | NA | 0x1 | 0x0 |
| Data provisioning Only when BL is on HDPL = 1 | 0x83 | 0x4 | RAM address where data to provision is written | 0x0 if success 0x4 if fail | NA if success Error code on 4 bytes if fail | 0x1 | 0x0 |


*Note:**	USB** **special** **commands** **differ** **from** **other** **protocols** **due** **to** **USB** **protocol** **specificities:*
    - *No** **opcode** **is** **used;** **the** **sub-opcode** **is** **used** **directly.*
    - *The** **sub-opcode** **is** **treated** **as** **a** **single** **byte,** **not** **two** **bytes.*
    - *Data** **is** **sent** **on** **the** **USB** **frame** **byte** **by** **byte;** **there** **is** **no** **need** **to** **specify** **the** **number** of data bytes to be transmitted.*
    - *Returned** **data** **and** **status** **are** **formatted** **according** **to** **the** **native** **USB** **protocol.*


### Bootloader selection

[Figure 75](#_bookmark479)* *shows the bootloader selection mechanism.





### Bootloader version

[Table 132](#_bookmark481)* *lists the STM32H5Ex/5Fx devices bootloader versions.

**Table** **132.** **STM32H5Ex/5Fx** **bootloader** **versions**
| Bootloader version number | Description | Known limitations |
| --- | --- | --- |
| V15.0 | Initial bootloader version | None |


## STM32H72xxx/73xxx devices


### Bootloader configuration

The STM32H72xxx/73xxx bootloader is activated by applying Pattern 10 (described in
[Table 2](#_bookmark7)). [Table 133](#_bookmark484)* *shows the hardware resources used by this bootloader.

**Table** **133.** **STM32H72xxx/73xxx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 66 MHz (using PLL clocked by the HSI) |
|  |  | - | CRS is enabled for the DFU to allow USB to be clocked by HSI48 48 MHz |
|  |  | - | 20 MHz derived from the PLLQ is used for FDCAN |
|  | RAM | - | 16 Kbytes, starting from address 0x24000000, are used by the bootloader firmware |
|  | System memory | - | 128 Kbytes, starting from address 0x1FF00000 contain the bootloader firmware. The bootloader start address is 0x1FF09800. |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
|  | Power | - | Voltage is set to Voltage Range 3. Bootloader SW is writing to the PWR_CR3 register using 4 bytes, locking this register. Only Power off/on unlocks it. This is fixed on the BL with 0x93 version. |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. Set as input until USART1 is detected on the BL version 0x93. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. Set as input until USART2 is detected on the BL version 0x93. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| USART3 (on PB10/PB11) | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PB11 pin: USART3 in reception mode. Used in alternate push-pull, pull-down mode. |
|  | USART3_TX pin | Output | PB10 pin: USART3 in transmission mode. Used in alternate push-pull, pull-down mode. Set as input until USART3 is detected on the BL version 0x93. |
| USART3 (on PD8/PD9) | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PD9 pin: USART3 in reception mode. Used in alternate push-pull, pull-down mode. |
|  | USART3_TX pin | Output | PD8 pin: USART3 in transmission mode. Used in alternate push-pull, pull-down mode. Set as input until USART3 is detected on the BL version 0x93. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1011100x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin |  | PB9 pin: data line is used in open-drain no pull mode. |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1011100x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PF1 pin: clock line is used in open-drain no pull mode. |
|  | I2C2_SDA pin |  | PF0 pin: data line is used in open-drain no pull mode. |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1011100x (x = 0 for write and x = 1 for read) |
|  | I2C3_SCL pin | Input/output | PA8 pin: clock line is used in open-drain no pull mode. |
|  | I2C3_SDA pin |  | PC9 pin: data line is used in open-drain no pull mode. |



**Table** **133.** **STM32H72xxx/73xxx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, no pull mode. |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, no pull mode. |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, no pull mode. |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in push-pull, no pull mode. |
| SPI3 | SPI3 | Enabled | The SPI3 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI3_MOSI pin | Input | PC12 pin: slave data input line, used in push-pull no pull mode |
|  | SPI3_MISO pin | Output | PC11 pin: slave data output line, used in push-pull, no pull mode. |
|  | SPI3_SCK pin | Input | PC10 pin: slave clock line, used in push-pull, no pull mode. |
|  | SPI3_NSS pin | Input | PA15 pin: slave chip select pin used in push-pull, no pull mode. |
| SPI4 | SPI4 | Enabled | The SPI4 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI4_MOSI pin | Input | PE14 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI4_MISO pin | Output | PE13 pin: slave data output line, used in push-pull, pull-down mode. |
|  | SPI4_SCK pin | Input | PE12 pin: slave clock line, used in push-pull, pull-dpwn mode. |
|  | SPI4_NSS pin | Input | PE11 pin: slave chip select pin used in push-pull, pull-up mode. Note: This IO can be tied to GND if the SPI master does not use it. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| DFU | USB | Enabled | USB FS configured in forced device mode. USB FS interrupt vector is enabled and used for USB DFU communications. |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in alternate push-pull, no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in alternate push-pull, no pull mode. No external pull-up resistor is required |
| FDCAN (on PH13/PH14) | FDCAN1 | Enabled | Once initialized the FDCAN1 configuration is: Connection bit rate 250 kbit/s Data bit rate 1000 kbit/s FrameFormat = FDCAN_FRAME_FD_BRS Mode = FDCAN_MODE_NORMAL AutoRetransmission = ENABLE TransmitPause = DISABLE ProtocolException = ENABLE |
|  | FDCAN1_Rx pin | Input | PH14 pin: FDCAN1 in reception mode. Used in alternate push-pull, pull-down mode. |
|  | FDCAN1_Tx pin | Output | PH13 pin: FDCAN1 in transmission mode. Used in alternate push-pull, pull-down mode. |
| FDCAN (on PD1/PD0) | FDCAN1 | Enabled | Once initialized the FDCAN1 configuration is: Connection bit rate 250 kbit/s Data bit rate 1000 kbit/s FrameFormat = FDCAN_FRAME_FD_BRS Mode = FDCAN_MODE_NORMAL AutoRetransmission = ENABLE TransmitPause = DISABLE ProtocolException = ENABLE |
|  | FDCAN1_Rx pin | Input | PD0 pin: FDCAN1 in reception mode. Used in alternate push-pull, pull-down mode. |
|  | FDCAN1_Tx pin | Output | PD1 pin: FDCAN1 in transmission mode. Used in alternate push-pull, pull-down mode. |


### Bootloader selection

[Figure 76](#_bookmark486)* *shows the bootloader selection mechanism.

**Figure** **76.** **Bootloader** **V9.0** **selection** **for** **STM32H72xxx/73xxx**




[Table 134](#_bookmark488)* *lists the STM32H72xxx/73xxx devices bootloader versions.

**Table** **134.** **STM32H72xxx/73xxx** **bootloader** **version**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V9.1 | Initial bootloader version | TCM_AXI OB cannot be modified using all BL interfaces String returned describing the memory size when using USB is wrong |
| V9.2 | Fix all issues of previous release | Crash loop when booting on the BL, setting RDP to Level1, doing a reset or power on/off and the USB cable is plugged. BL is not working in RDP Level1 when TCM_AXI_SHARED option byte is not “0”. Value of this OB must be set to “0” before going to RDP L1. Bootloader SW is writing to the PWR_CR3 register using 4 bytes, which is locking this register. Only Power off/on will unlock it. |
| V9.3 | Fix all issues of previous release. Modify USART TX from push pull mode in the previous versions to input. | None |





### Bootloader configuration

The STM32H74xxx/75xxx bootloader is activated by applying Pattern 10 (described in
[Table 2](#_bookmark7)). [Table 135](#_bookmark491)* *shows the hardware resources used by this bootloader.

**Table** **135.** **STM32H74xxx/75xxx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 64 MHz using the HSI. The HSI clock source is used at startup (interface detection phase) and when USART or SPI or I2C interface is selected. |
|  |  | - | CRS is enabled for the DFU to allow USB to be clocked by HSI48 48 MHz |
|  |  | - | Clock used for the FDCAN is fixed to 20 MHz and is derived from PLLQ |
|  | RAM | - | 16 Kbytes, starting from address 0x20000000, and 208 Kbytes (reduced to 20 Kbytes in V9.1 version) starting from address 0x24000000, are used by the bootloader firmware |
|  | System memory | - | 122 Kbytes, starting from address 0x1FF00000 contain the bootloader firmware. The bootloader start address is 0x1FF09800. |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
|  | Power | - | Voltage is set to Range 3. Bootloader software writes to the PWR_CR3 register using 4 bytes, which locks this register. Only Power off/on unlocks it. This is fixed on the bootloader with 0x91 version. |
| USART1 (on PA9/PA10) | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. Set as input until USART1 is detected on the bootloader version 0x91. |
| USART1 (on PB14/PB15) | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PB15 pin: USART1 in reception mode.Used in input pull-up mode. |
|  | USART1_TX pin | Output | PB14 pin: USART1 in transmission mode. Used in alternate function push pull pull-up mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in alternate push-pull, no pull mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. Set as input until USART3 is detected on the bootloader version 0x91. |
| USART3 | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PB11 pin: USART3 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART3_TX pin | Output | PB10 pin: USART3 in transmission mode. Used in alternate push-pull, pull-up mode. Set as input until USART3 is detected on the bootloader version 0x91. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 400 kHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b1001110x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin | Input/output | PB9 pin: data line is used in open-drain no pull mode. |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 400 kHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b1001110x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PF1 pin: clock line is used in open-drain no pull mode. |
|  | I2C2_SDA pin | Input/output | PF0 pin: data line is used in open-drain no pull mode. |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 400 kHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b1001110x (x = 0 for write and x = 1 for read) |
|  | I2C3_SCL pin | Input/output | PA8 pin: clock line is used in open-drain no pull mode. |
|  | I2C3_SDA pin | Input/output | PC9 pin: data line is used in open-drain no pull mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, no pull mode. |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, no pull mode. |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, no pull mode. |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in push-pull, no pull mode. |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PI3 pin: slave data input line, used in push-pull, no pull mode. |
|  | SPI2_MISO pin | Output | PI2 pin: slave data output line, used in push-pull, no pull mode. |
|  | SPI2_SCK pin | Input | PI1 pin: slave clock line, used in push-pull, no pull mode. |
|  | SPI2_NSS pin | Input | PI0 pin: slave chip select pin used in push-pull, no pull mode. |
| SPI3 | SPI3 | Enabled | The SPI3 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI3_MOSI pin | Input | PC12 pin: slave data input line, used in push-pull, no pull mode. |
|  | SPI3_MISO pin | Output | PC11 pin: slave data output line, used in push-pull, no pull mode. |
|  | SPI3_SCK pin | Input | PC10 pin: slave clock line, used in push-pull, no pull mode. |
|  | SPI3_NSS pin | Input | PA15 pin: slave chip select pin used in push-pull, no pull mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI4 | SPI4 | Enabled | The SPI4 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI4_MOSI pin | Input | PE14 pin: slave data input line, used in push-pull, no pull mode. |
|  | SPI4_MISO pin | Output | PE13 pin: slave data output line, used in push-pull, no pull mode. |
|  | SPI4_SCK pin | Input | PE12 pin: slave clock line, used in push-pull, no pull mode. |
|  | SPI4_NSS pin | Input | PE11 pin: slave chip select pin used in push-pull, no pull mode. |
| DFU | USB | Enabled | USB FS configured in forced device mode. USB FS interrupt vector is enabled and used for USB DFU communications. |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in alternate push-pull, no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in alternate push-pull, no pull mode. No external pull-up resistor is required |
| FDCAN | FDCAN1 | Enabled | Once initialized the FDCAN1 configuration is: Connection bit rate 250 kbit/s Data bit rate 1000 kbit/s FrameFormat = FDCAN_FRAME_FD_BRS Mode = FDCAN_MODE_NORMAL AutoRetransmission = ENABLE TransmitPause = DISABLE ProtocolException = ENABLE |
|  | FDCAN1_Rx pin | Input | PH14 pin: FDCAN1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | FDCAN1_Tx pin | Output | PH13 pin: FDCAN1 in transmission mode. Used in alternate push-pull, pull-up mode. |


*Note:**	To** **connect** **to** **the** **bootloader** **USART1** **using** **PB14/PB15** **pins,** **user** **must** **send** **two** synchronization bytes. Baudrate is limited to 115200.*
*DFU** **mode** **does** **not** **support** **USBREGEN** **mode.** **If** **STM32** **is** **powered** **by** **an** **1.8** **V** **source,** **it** is not possible to use the BL DFU unless 3.3 V is provided*




[Figure 77](#_bookmark494)* *shows the bootloader selection mechanism.

**Figure** **77.** **Bootloader** **V9.x** **selection** **for** **STM32H74xxx/75xxx**




[Table 136](#_bookmark496)* *lists the STM32H74xxx/75xxx devices bootloader versions.

**Table** **136.** **STM32H74xxx/75xxx** **bootloader** **version**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V13.2 (0xD2) | Initial bootloader version | Go command is not working USART2 connection is not working SPI1 connection is not working Mass erase does not work correctly on I2C (only Bank2 is erased in this command) |
| V13.3 (0xD3) | Switch USB clock input from HSE to HSI48 with CRS Fix known limitations on the V13.2 | Bank erase is not working on USART/SPI and I2C DFU mass-erase not working |
| V9.0 (0x90) | Add support of FDCAN interface Fix V13.3 limitations V9.0 is the latest version in production and replaces V13.2 and V13.3 | First ACK not received on Go command when using USART or SPI On the FDCAN write memory, write of data with length  63 bytes fails If PB15 is set to GND, user cannot connect to BL interfaces. Only the USB is able to connect as it uses interrupt for detection. PB15 must not be pulled down if USART1 on PB14/PB15 is not used Jump issue on some application.Application stack pointer must be lower than (RAM end @ - 16 bytes) to guarantee it is working Additional reset needed after power off/on to enable connection to the BL interfaces. As a workaround user can add a pull up on PA11 pin.’ Cannot program the CM4_BOOT_ADDx option byte using BL in dual core case FDCAN Get version command is giving a bad FDCAN protocol version (0x11). It must be 0 x10 (V1.0) SRAM1/SRAM2/SRAM3 (0x30000000- 0x30047FFF) and ITCM memories not accessible by the BL Number of supported commands is wrong (13 instead of 11) |




| Version number | Description | Known limitations |
| --- | --- | --- |
| V9.1 (0x91) | Fix V9.0 limitations Fix the configuration of PWR control register CR3. Bootloader is no more blocking the change of PWR source Adjust USB, I2C erase and program timings and fix them Fix FDCAN version from V1.0 to V1.1 Fix write issue when using FDCAN Fix missing PCROP disable in RDP level1 regression Update option byte support to handle all possible use cases | If PB15 is set to GND, user cannot connect to BL interfaces SRAM1/SRAM2/SRAM3 (0x30000000 to 0x30047FFF) and ITCM memories not accessible by the BL Jump issue on some applications. Application stack pointer must be lower than (RAM end address - 16 bytes) to guarantee it is working Erase on bank2 not working as expected Root cause: check bad busy value while erasing on bank2. Behavior: when erase on bank2 is requested, SW exits while the operation is ongoing. Sending a new command invoking the flash memory after the erase can hang the system. Workaround: worst case erase timing from the product datasheet can be added after the erase command to allow the FLITF to complete the erase. A safer method is to use a RAM patch for the erase command. Same data are output on the USART1_TX PB14 when using USART1 on PA10/PA9. Root cause: both USART1 TX pins PA9 and PB14 configured as alternate push pull-up and PB15/PB14 pins not disabled when PA10/PA9 set used by the customer. Behavior: same data are output on USART1 TX pins PA9 and PB14. Caution: take care to what PB14 is connected on your design to not damage it when using USART1 on PA10/PA9. Same data are output on the USART1_TX PA9 when using USART1 on PB15/PB14. Root cause: both USART1 TX pins PB14 and PA9 configured as alternate push pull-up and PA10/PA9 pins not disabled when PB15/PB14 set used by the customer. Behavior: same data are output on USART1 TX pins PA9 and PB14. Caution: take care to what PA9 is connected on your design to not damage it when using USART1 on PB15/14. |




| Version number | Description | Known limitations |
| --- | --- | --- |
| V9.2 (0x92) | Fix V9.1 limitations: Same data on PA9 when USART1 is used on PB15/PB14. Same data on PB14 when USART1 is used on PA10/PA9. Erase on bank2 not working as expected. Enhancements: Erase timeouts increased | If PB15 is set to GND, user cannot connect to BL interfaces. SRAM1/SRAM2/SRAM3 (0x30000000 to 0x30047FFF) and ITCM memories not accessible by the BL. Jump issue on some applications. Application stack pointer must be lower than (RAM end address - 16 bytes) to guarantee it is working. |





### Bootloader configuration

The STM32H7A3xx/7B3xx/7B0xx bootloader is activated by applying Pattern 10 (described in [Table 2](#_bookmark7)). [Table 137](#_bookmark499)* *shows the hardware resources used by this bootloader.

**Table** **137.** **STM32H7A3xx/7B3xx/7B0xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 64 MHz using the HSI. |
|  |  | - | CRS is enabled for the DFU to allow USB to be clocked by HSI48 48 MHz |
|  |  | - | Clock used for the FDCAN is fixed to 20 MHz and is derived from PLLQ |
|  | RAM | - | 16 Kbytes, starting from address 0x24000000, are used by the bootloader firmware |
|  | System memory | - | 128 Kbytes, starting from address 0x1FF00000 contain the bootloader firmware. The bootloader start address is 0x1FF0A000 |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
|  | Power | - | Bootloader software writes to PWR_CR3 register using four bytes, which locks it, only Power off/on unlocks it. Fixed on the bootloader with 0x92 versions. |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. Set as input until USART1 is detected on the bootloader version 0x92. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. Set as input until USART2 is detected on the bootloader version 0x92. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| USART3 on (PB10/PB11) | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PB11 pin: USART3 in reception mode. Used in alternate push-pull, pull-down mode. |
|  | USART3_TX pin | Output | PB10 pin: USART3 in transmission mode. Used in alternate push-pull, pull-down mode. Set as input until USART3 is detected on the bootloader version 0x92. |
| USART3 on (PD8/PD9) | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PD9 pin: USART3 in reception mode. Used in alternate push-pull, pull-down mode. |
|  | USART3_TX pin | Output | PD8 pin: USART3 in transmission mode. Used in alternate push-pull, pull-down mode. Set as input until USART3 is detected on the bootloader version 0x92. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 400 kHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b10101111x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin | Input/output | PB9 pin: data line is used in open-drain no pull mode. |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 400 kHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b10101111x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PF1 pin: clock line is used in open-drain no pull mode. |
|  | I2C2_SDA pin | Input/output | PF0 pin: data line is used in open-drain no pull mode. |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 400 kHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b10101111x (x = 0 for write and x = 1 for read) |
|  | I2C3_SCL pin | Input/output | PA8 pin: clock line is used in open-drain no pull mode. |
|  | I2C3_SDA pin | Input/output | PC9 pin: data line is used in open-drain no pull mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, no pull-up no pull-down mode. |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, no pull-up no pull-down mode. |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull no pull-up, no pull-up no pull-down mode. |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in push-pull, pull-down mode. |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PI3 pin: slave data input line, used in push-pull, no pull mode. |
|  | SPI2_MISO pin | Output | PI2 pin: slave data output line, used in push-pull, no pull mode. |
|  | SPI2_SCK pin | Input | PI1 pin: slave clock line, used in push-pull, no pull mode. |
|  | SPI2_NSS pin | Input | PI0 pin: slave chip select pin used in push-pull, no pull mode. |
| SPI3 | SPI3 | Enabled | The SPI3 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI3_MOSI pin | Input | PC12 pin: slave data input line, used in push-pull, no pull mode |
|  | SPI3_MISO pin | Output | PC11 pin: slave data output line, used in push-pull, no pull mode. |
|  | SPI3_SCK pin | Input | PC10 pin: slave clock line, used in push-pull, no pull mode. |
|  | SPI3_NSS pin | Input | PA15 pin: slave chip select pin used in push-pull, no pull mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI4 | SPI4 | Enabled | The SPI4 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI4_MOSI pin | Input | PE14 pin: slave data input line, used in push-pull, no pull up, no pull down mode |
|  | SPI4_MISO pin | Output | PE13 pin: slave data output line, used in push-pull, no pull up, no pull down mode. |
|  | SPI4_SCK pin | Input | PE12 pin: slave clock line, used in push-pull, no pull up, no pull down mode. |
|  | SPI4_NSS pin | Input | PE11 pin: slave chip select pin used in push-pull, no pull up, no pull down mode. |
| DFU | USB | Enabled | USB FS configured in forced device mode. USB FS interrupt vector is enabled and used for USB DFU communications. |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in alternate push-pull, no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in alternate push-pull, no pull mode. No external pull-up resistor is required. |
| FDCAN on (PH13/PH14) | FDCAN1 | Enabled | Once initialized the FDCAN1 configuration is: Connection bit rate 250 kbit/s Data bit rate 1000 kbit/s FrameFormat = FDCAN_FRAME_FD_BRS Mode = FDCAN_MODE_NORMAL AutoRetransmission = ENABLE TransmitPause = DISABLE ProtocolException = ENABLE |
|  | FDCAN1_Rx pin | Input | PH14 pin: FDCAN1 in reception mode. Used in alternate push-pull, pull-down mode. |
|  | FDCAN1_Tx pin | Output | PH13 pin: FDCAN1 in transmission mode. Used in alternate push-pull, pull-down mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| FDCAN on (PD1/PD0) | FDCAN1 | Enabled | Once initialized the FDCAN1 configuration is: Connection bit rate 250 kbit/s Data bit rate 1000 kbit/s FrameFormat = FDCAN_FRAME_FD_BRS Mode = FDCAN_MODE_NORMAL AutoRetransmission = ENABLE TransmitPause = DISABLE ProtocolException = ENABLE |
|  | FDCAN1_Rx pin | Input | PD0 pin: FDCAN1 in reception mode. Used in alternate push-pull, pull-down mode. |
|  | FDCAN1_Tx pin | Output | PD1 pin: FDCAN1 in transmission mode. Used in alternate push-pull, pull-down mode. |





[Figure 77](#_bookmark494)* *shows the bootloader selection mechanism.

**Figure** **78.** **Bootloader** **V9.x** **selection** **for** **STM32H7A3xx/7B3xx/7B0xx**




[Table 138](#_bookmark503)* *lists the STM32H7A3xx/7B3xx/7B0xx devices bootloader versions.

**Table** **138.** **STM32H7A3xx/7B3xx/7B0xx** **bootloader** **version**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V9.0 | Initial bootloader version | String returned describing the flash memory size when using USB is wrong (expected value 256 x 8 KB, but returns 256 x 2 KB) OTP memory is not supported by the bootloader |
| V9.1 | Fixes all issues of previous release. | Crash loop when booting on the bootloader, setting RDP to Level1, doing a reset or power on/off and the USB cable is plugged. Bootloader software is writing to the PWR_CR3 register using four bytes, which is locking this register. Only Power off/on unlocks it |
| V9.2 | Fix all issues of previous release Modify USART TX from push pull mode in the previous versions to input. | None |





### Bootloader configuration

The STM32H7Rxxx/7S7xxx bootloader is activated by applying Pattern 17 (described in
[Table 2](#_bookmark7)). [Table 139](#_bookmark506)* *shows the hardware resources used by this bootloader.

**Table** **139.** **STM32H7Rxxx/7Sxxx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 380 MHz using the PLL clocked by HSI |
|  |  | - | 20 MHz derived from the PLLQ is used for FDCAN. |
|  |  | HSI48 enabled | CRS is enabled for the DFU to allow USB to be clocked by HSI48 48 MHz. |
|  | RAM | - | 16 Kbytes, starting from address 0x24020000, are used by the bootloader firmware |
|  | System memory | - | 32 Kbytes, starting from address 0x1FF18000 contain the bootloader firmware. |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. Set as input until USART1 is detected on the bootloader version 0x91. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in alternate push-pull, no pull mode. Used in alternate push-pull, no pull mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Used in alternate push-pull, no pull mode. Set as input until USART3 is detected on the bootloader version 0x91. |
| USART3 | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PD9 pin: USART3 in reception mode. Used in alternate push-pull, no pull mode. |
|  | USART3_TX pin | Output | PD8 pin: USART3 in transmission mode. Set as input until USART3. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| UART4 | UART4 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | UART4_RX pin | Input | PD0 pin: UART4 in reception mode. Used in alternate push-pull, no pull mode. |
|  | UART4_TX pin | Output | PD1 pin: UART4 in transmission mode. Set as input until UART4 is detected. |
| I2C1(1) | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1100001x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB8 pin: clock line is used in open-drain pull-up mode. |
|  | I2C1_SDA pin |  | PB7 pin: data line is used in open-drain pull-up mode. |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1100001x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PB10 pin: clock line is used in open-drain pull-up mode. |
|  | I2C2_SDA pin |  | PB11 pin: data line is used in open-drain pull-up mode. |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1100001x (x = 0 for write and x = 1 for read) |
|  | I2C3_SCL pin | Input/output | PA8 pin: clock line is used in open-drain pull-up mode. |
|  | I2C3_SDA pin |  | PC9 pin: data line is used in open-drain pull-up mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, no pull mode. |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, no pull mode. |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, no pull mode. |
|  | SPI1_NSS pin |  | PA4 pin: slave chip select pin used in push-pull, no pull mode. |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PB15 pin: slave data input line, used in push-pull, no pull mode. |
|  | SPI2_MISO pin | Output | PB14 pin: slave data output line, used in push-pull, no pull mode. |
|  | SPI2_SCK pin | Input | PB13 pin: slave clock line, used in push-pull, no pull mode. |
|  | SPI2_NSS pin |  | PB12 pin: slave chip select pin used in push-pull, no pull mode. |
| SPI3 | SPI3 | Enabled | The SPI3 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI3_MOSI pin | Input | PC12 pin: slave data input line, used in push-pull, no pull mode. |
|  | SPI3_MISO pin | Output | PB4 pin: slave data output line, used in push-pull, no pull mode. |
|  | SPI3_SCK pin | Input | PB3 pin: slave clock line, used in push-pull, no pull mode. |
|  | SPI3_NSS pin |  | PA15 pin: slave chip select pin used in push-pull, no pull mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| DFU | USB | Enabled | USB FS configured in forced device mode. USB FS interrupt vector is enabled and used for USB DFU communications. |
|  | USB_DM pin | Input/output | PM12: USB DM line. Used in alternate push-pull, no pull mode. |
|  | USB_DP pin |  | PM11: USB DP line. Used in alternate push-pull, no pull mode. No external pull-up resistor is required |
| FDCAN | FDCAN2 | Enabled | Once initialized the FDCAN1 configuration is: Connection bit rate 250 kbit/s Data bit rate 1000 kbit/s FrameFormat = FDCAN_FRAME_FD_BRS Mode = FDCAN_MODE_NORMAL AutoRetransmission = ENABLE TransmitPause = DISABLE ProtocolException = ENABLE |
|  | FDCAN2_Rx pin | Input | PB5 pin: FDCAN2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | FDCAN2_Tx pin | Output | PB1 pin: FDCAN2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| I3C1(1) | I3C1 | Enabled | Mode: target mode Aval timing:0x4E DMA Reg RX: disabled DMA Req TX: disabled Status FIFO: disabled DMA Req status: disabled DMA Req control: disabled IBI: Enabled Additional data after IBI ACK-ed: 1 byte IBI configuration: Mandatory Data Byte (MDB) All IT disabled except RXFNE (Receive FIFO Interrupt). The RXFNE interruption is disabled after SYNC byte detection by the bootloader. |
|  | I3C1_SCL pin | Input/output | PB8 pin: I3C1 in transmission mode. Used in alternate push-pull, no pull mode. |
|  | I3C1_SDA pin |  | PB7 pin: I3C1 in transmission mode. Used in alternate push-pull, no pull mode. |

1. I2C1 and I3C1 are exclusive: only one of them can be used, depending on the option byte FLASH_OBW2SR_I2C_NI3C.



| Special commands supported (USART/I2C/SPI/FDCAN/USB/I3C) Based on Go/Read commands on virtual addresses |  |  |  |
| --- | --- | --- | --- |
| Function | Command | Virtual address | Data received |
| Get Security State | Read | 0xFF010001 | 4 bytes security status |
| Get product state |  | 0xFF010002 |  |
| Data Provisioning | Go | 0xFF83xxxx (xxxx indicates LSB address of the wrapper on the SRAM: 0x2404xxxx) | N/A |
| Change Product State |  | 0xFF0100xx (xx indicates new product state value: 17 for provisioning, 72 for closed, and 5C for locked) |  |
| Change Secure OB |  | 0xFF02xxxx (xxxx indicates LSB address of the wrapper on the SRAM: 0x2404xxxx)(1) |  |

1. According to data written at address 0x2404xxxx, you can select option byte: 0: secure option byte i-Rot Select
1: secure option byte Writeprotection 2: secure option byte writeunprotect 3: secure option byte HDP.
For secure option bytes i-Rot Select, Writeprotection or HDP start and HDP end, the register values will be at address (0x2404xxxx + 0x00000004).
Example: HDP options bytes:
write at 0x24040000 the value 0x00000003
write at 0x24040004 the value 0x00EE0011 (EE: HDPend, 11:HDPstart) go at 0xFF020000.




[Figure 77](#_bookmark494)* *shows the bootloader selection mechanism.

**Figure** **79.** **Bootloader** **V14.x** **selection** **for** **STM32H7Rxxx/7Sxxx**






| De-Init system Configure system clock to 380 MHz with HSI and PLL |  |
| --- | --- |
|  |  |






























s



















MS56537V2




[Table 141](#_bookmark512)* *lists the STM32H7Rxxx/7Sxxx devices bootloader versions.

**Table** **141.** **STM32H7Rxxx/7Sxxx** **bootloader** **version**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V14.3 | Initial bootloader version, used only for RevY | None |
| V14.4 | Bootloader compatible with RevB | None |
| V14.5 | Change on security descriptor located on 0x1FF1FD00 (256 bytes) to be aligned with latest SFSP release. | None |


### Jump to bootloader

If a user application jumping to the bootloader has the protection clock bits (xSPICKP or FMCCKP) enabled, the bootloader will be stuck/crash on the clock configuration.
The following fields cannot be modified when FMCCKP bit from RCC_CKPROT register is set to 1: PLL1ON, PLL2ON, PLL1QEN, PLL2REN, HSEON, HSION, CSION, FMCEN, FMCLPEN, and FMCRST.
The following fields cannot be modified when xSPICKP bit from RCC_CKPROTR register is set to 1: PLL2ON, PLL2SEN, PLL2TEN, HSEON, HSION, CSION, XSPIxEN, XSPIxLPEN,
and XSPIxRST..
Refer to the section describing clock protection on RM0477.
At the startup; the bootloader deinitialises all the peripherals (including the clock), then reconfigures the clock based on PLL1 from HSI. In this case the bootloader is not be able to switch correctly to the needed default clock (crash or hang may be seen, depending on the application clock configuration)
Ensure that the protection clock bits (xSPICKP or FMCCKP) are disabled before jumping to the BL.




### Bootloader configuration

The STM32L01xxx/02xxx bootloader is activated by applying Pattern 6 (described in
[Table 2](#_bookmark7)). [Table 142](#_bookmark516)* *shows the hardware resources used by this bootloader.

**Table** **142.** **STM32L01xxx/02xxx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 32 MHz with HSI 16 MHz as clock source. |
|  | RAM | - | 2 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 4 Kbytes, starting from address 0x1FF00000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| USART2 (on PA9/PA10) | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA10 pin: USART2 in reception mode. Used in input pull-up mode. |
|  | USART2_TX pin | Output | PA9 pin: USART2 in transmission mode. Used in input pull-up |
| USART2 (on PA2/PA3) | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode.Used in input pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Used in input pull-up mode. |
| USART2 | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI1 (for all device packages except TSSOP14) | SPI1 | Enabled | The SPI1 configuration is: Slave mode, Full Duplex, 8-bit MSB, Speed up to 8 MHz, Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in push-pull, pull-down mode. Note: This IO can be tied to GND if the SPI master does not use it. |
| SPI1 (only for devices on TSSOP14 package) | SPI1 | Enabled | The SPI1 configuration is: Slave mode, Full Duplex, 8-bit MSB, Speed up to 8 MHz, Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI1_MISO pin | Output | PA14 pin: slave data output line, used in push-pull, pull-down mode. Note: This IO is also used as SWCLK for debug interface, as a consequence debugger cannot connect to the device in on-the-fly mode when the bootloader is running. |
|  | SPI1_SCK pin | Input | PA13 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in push-pull, pull-down mode. Note: NSS pin synchronization is required on bootloader with SPI1 interface for devices on TSSOP14 package. |


The system clock is derived from the embedded internal high-speed RC for all bootloader interfaces. No external quartz is required for bootloader operations.
*Note:**	Due** **to** **empty** **check** **mechanism** **present** **on** **this** **product,** **it** **is** **not** **possible** **to** **jump** **from** **user** code to system bootloader. Such jump results in a jump back to user flash memory space. But if the first 4 bytes of user flash memory (at 0x0800 0000) are empty at the moment of the jump (i.e. erase first sector before jump or execute code from SRAM while flash is empty), then system bootloader is executed when jumped to.*




The [Table 80](#_bookmark519)* *shows the bootloader selection mechanism.

**Figure** **80.** **Bootloader** **selection** **for** **STM32L01xxx/02xxx**




The following table lists the STM32L01xxx/02xxx devices bootloader versions.

**Table** **143.** **STM32L01xxx/02xxx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V12.2 | Initial bootloader version | Bootloader not functional with SPI1 interface for devices on TSSOP14 package. |
| V12.3 | Adds support of SPI interface for devices in TSSOP14 package. | For the SPI1 interface for devices in TSSOP14, a falling edge on NSS pin is required before staring communication, to properly synchronize the SPI interface. If the NSS pin is grounded (all time from device reset) the SPI communication is not synchronized and bootloader does not work properly with the SPI interface. |





### Bootloader configuration

The STM32L031xx/041xx bootloader is activated by applying Pattern 2 (described in
[Table 2](#_bookmark7)). The following table shows the hardware resources used by this bootloader.

**Table** **144.** **STM32L031xx/041xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 32 MHz with HSI 16 MHz as clock source. |
|  | RAM | - | 4 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 4 Kbytes, starting from address 0x1FF00000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| USART2 (on PA9/PA10) | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA10 pin: USART2 in reception mode. Used in input pull-up mode. |
|  | USART2_TX pin | Output | PA9 pin: USART2 in transmission mode. Used in input pull-up mode. |
| USART2 (on PA2/PA3) | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in input pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode.Used in input pull-up mode. |
| USART2 | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode, Full Duplex, 8-bit MSB, Speed up to 8 MHz, Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in push-pull, pull-down mode. Note: This IO can be tied to GND if the SPI master does not use it. |


The system clock is derived from the embedded internal high-speed RC for all bootloader interfaces. No external quartz is required for bootloader operations.
The bootloader Read/Write commands do not support SRAM space for this product.




[Figure 81](#_bookmark526)* *shows the bootloader selection mechanism.

**Figure** **81.** **Bootloader** **selection** **for** **STM32L031xx/041xx**





















| Disable all other interfaces clocks |  |
| --- | --- |
|  |  |







### Bootloader version

[Table 145](#_bookmark528)* *lists the STM32L031xx/041xx devices bootloader versions.

**Table** **145.** **STM32L031xx/041xx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V12.0 | Initial bootloader version | None |





### Bootloader configuration

The STM32L05xxx/06xxx bootloader is activated by applying Pattern 1 (described in
[Table 2](#_bookmark7)). [Table 146](#_bookmark531)* *shows the hardware resources used by this bootloader.

**Table** **146.** **STM32L05xxx/06xxx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 32 MHz with HSI 16 MHz as clock source. |
|  | Power | - | Voltage range is set to Voltage Range 1. |
|  | RAM | - | 4 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 4 Kbytes, starting from address 0x1FF00000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in push-pull, pull-down mode. |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PB15 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI2_MISO pin | Output | PB14 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI2_SCK pin | Input | PB13 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI2_NSS pin | Input | PB12 pin: slave chip select pin used in push-pull, pull-down mode. |


The system clock is derived from the embedded internal high-speed RC for all bootloader interfaces. No external quartz is required for bootloader operations.




[Figure 82](#_bookmark533)* *shows the bootloader selection mechanism.

**Figure** **82.** **Bootloader** **selection** **for** **STM32L05xxx/06xxx**





















| Disable all other interfaces clocks |  |
| --- | --- |
|  |  |







### Bootloader version

[Table 147](#_bookmark535)* *lists the STM32L05xxx/06xxx devices bootloader versions:

**Table** **147.** **STM32L05xxx/06xxx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V12.0 | Initial bootloader version | PA13 set in alternate push-pull, pull-up mode and PA14 set in alternate pull-up pull-down mode even if not used. |






Two bootloader versions are available on STM32L07xxx/08xxx devices:
    - V4.x supporting USART1, USART2 USART2, and DFU (USB FS device). This version is embedded in STM32L072xx/73xx and STM32L082xx/83xx devices.
    - V11.x supporting USART1, USART2, I2C1, I2C2, SPI1 and SPI2. This version is embedded in other STM32L071xx/081xx devices.


### Bootloader V4.x

#### Bootloader configuration

The STM32L07xxx/08xxx bootloader is activated by applying Pattern 2 or Pattern 7 when dual bank boot feature is available (described in [Table 2](#_bookmark7)). [Table 148](#_bookmark539)* *shows the hardware resources used by this bootloader.

**Table** **148.** **STM32L07xxx/08xxx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 32 MHz with HSI 16 MHz as clock source. |
|  | RAM | - | 4 Kbytes, starting from address 0x20000000, are used by the bootloader firmware. |
|  | System memory | - | 8 Kbytes, starting from address 0x1FF00000, contain the bootloader firmware. |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| DFU | USB | Enabled | USB FS configured in forced device mode. USB FS interrupt vector is enabled and used for USB DFU communications. |
|  | USB_DM pin | Input/output | PA11 pin: USB FS DM line. Used in alternate push-pull, no pull mode. |
|  | USB_DP pin |  | PA12 pin: USB FS DP line. Used in alternate push-pull, no pull mode. No external pull-up resistor is required. |


The system clock is derived from the embedded internal high-speed RC for all bootloader interfaces. No external quartz is required for bootloader operations.




[Figure 83](#_bookmark541)* *and [Figure 84](#_bookmark542)* *show the bootloader selection mechanism.

**Figure** **83.** **Dual** **bank** **boot** **implementation** **for** **STM32L07xxx/08xxx** **bootloader** **V4.x**







































Bootloader


Configure System clock to 32 MHz with HSI


System Init (Clock, GPIOs, IWDG, SysTick)


Configure USB FS device




0x7F received on USARTx


no


---


yes

| Disable all interrupt sources |  |
| --- | --- |
|  |  |





USB cable Detected
no


---


yes



MSv38442V1

#### Bootloader version

[Table 149](#_bookmark544)* *lists the STM32L07xxx/08xxx devices bootloader versions.



| Version number | Description | Known limitations |
| --- | --- | --- |
| V4.0 | Initial bootloader version | PA4, PA5, PA6 and PA7 IOs are configured in pull-down mode despite not used by bootloader |
| V4.1 | This new version implements the Dual Bank Boot feature. | PA4, PA5, PA6 and PA7 IOs are configured in pull-down mode despite not used by bootloader The USB bootloader fails on some machines using a high speed controller. The bootloader is detected. but then data transaction fails. Root causes: De-synchronization between USB controller and bootloader SW due to the controller high speed transactions. Controller high speed inter-packet delay seems not sufficient for the bootloader SW (based on interrupt routines) to serve all needed transactions (the delay needed by the BL is nearly 25 µs). Some servicing IT are missed. This results in a communication fail, causing Write command to fail. Workarounds: Add an USB HUB between the host and the MCU. This relaxes transactions inter-packet delay, and allows the BL SW to perform correctly the task. Use USB controller/host that increase inter-packet delay. On new designs, use DFU SW that fix the issue in user flash memory. |


### Bootloader V11.x

#### Bootloader configuration

The STM32L07xxx/08xxx bootloader is activated by applying Pattern 2 or Pattern 7 when dual bank boot feature is available (see in [Table 2](#_bookmark7)). [Table 150](#_bookmark547)* *shows the hardware resources used by this bootloader.

**Table** **150.** **STM32L07xxx/08xxx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 32 MHz with HSI 16 MHz as clock source. |
|  | RAM | - | 5 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 8 Kbytes, starting from address 0x1FF00000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 400 kHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b1000010x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: I2C1 clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin | Input/output | PB7 pin: I2C1 data line is used in open-drain no pull mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 400 kHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b1000010x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PB10 pin: I2C2 clock line is used in open-drain no pull mode. |
|  | I2C2_SDA pin | Input/output | PB11 pin: I2C2 data line is used in open-drain no pull mode. |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in push-pull, pull-down mode. Note: This IO can be tied to GND if the SPI master does not use it. |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PB15 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI2_MISO pin | Output | PB14 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI2_SCK pin | Input | PB13 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI2_NSS pin | Input | PB12 pin: slave chip select pin used in push-pull, pull-down mode. Note: This IO can be tied to GND if the SPI master does not use it. |


The system clock is derived from the embedded internal high-speed RC for all bootloader interfaces. No external quartz is required for bootloader operations.


#### Bootloader selection

[Figure 85](#_bookmark549)* *and [Figure 86](#_bookmark550)* *show the bootloader selection mechanism.

**Figure** **85.** **Dual** **bank** **boot** **implementation** **for** **STM32L07xxx/08xxx** **bootloader** **V11.x**
































































| Disable all other |  |
| --- | --- |
| interfaces clocks |  |
|  |  |








#### Bootloader version

[Table 151](#_bookmark552)* *lists the STM32L07xxx/08xxx devices bootloader versions:

**Table** **151.** **STM32L07xxx/08xxx** **bootloader** **V11.x** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V11.1 | Initial bootloader version | None |
| V11.2 | This new version implements the Dual Bank Boot feature. | None |





### Bootloader configuration

The STM32L1xxx6(8/B)A bootloader is activated by applying Pattern 1 (described in
[Table 2](#_bookmark7)). [Table 152](#_bookmark555)* *shows the hardware resources used by this bootloader.

**Table** **152.** **STM32L1xxx6(8/B)A** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 16 MHz. |
|  | RAM | - | 2 Kbytes, starting from address 0x20000000, are used by the bootloader firmware. |
|  | System memory | - | 4 Kbytes, starting from address 0x1FF00000 contain the bootloader firmware. |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value and is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
|  | Power | - | Voltage is set to Voltage Range 1. |
| USART1 | USART1 | Enabled | Once initialized, the USART1 configuration is 8 bits, even parity, and one stop bit. |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART2 | USART2 | Enabled | Once initialized, the USART2 configuration is 8 bits, even parity, and one stop bit. |
|  | USART2_RX pin | Input | PD6 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PD5 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host. |


The system clock is derived from the embedded internal high-speed RC, no external . No external quartz is required for the bootloader execution.

### Bootloader selection

The figure below shows the bootloader selection mechanism.

**Figure** **87.** **Bootloader** **selection** **for** **STM32L1xxx6(8/B)A** **devices**

### Bootloader version

The following table lists the STM32L1xxx6(8/B)A devices bootloader versions:

**Table** **153.** **STM32L1xxx6(8/B)A** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V2.0 | Initial bootloader version | When a Read Memory or Write Memory command is issued with an unsupported memory address and a correct address checksum (i.e. address 0x6000 0000), the command is aborted by the bootloader device, but the NACK (0x1F) is not sent to the host. As a result, the next two bytes ( the number of bytes to be read/written and its checksum) are considered as a new command and its checksum.(1) |

1. If the “number of data - 1” (N-1) to be read/written is not equal to a valid command code, the limitation is not perceived from the host, as the command is NACK-ed anyway (as an unsupported new command).




### Bootloader configuration

The STM32L1xxx6(8/B) bootloader is activated by applying Pattern 1 (described in [Table 2](#_bookmark7)). The following table shows the hardware resources used by this bootloader.

**Table** **154.** **STM32L1xxx6(8/B)** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 16 MHz. |
|  | RAM | - | 2 Kbytes, starting from address 0x20000000, are used by the bootloader firmware. |
|  | System memory | - | 4 Kbytes, starting from address 0x1FF00000 contain the bootloader firmware. |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value and is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
|  | Power | - | Voltage is set to Voltage Range 1. |
| USART1 | USART1 | Enabled | Once initialized, the USART1 configuration is 8 bits, even parity, and one stop bit. |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART2 | USART2 | Enabled | Once initialized, the USART2 configuration is 8 bits, even parity, and one stop bit. |
|  | USART2_RX pin | Input | PD6 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PD5 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host. |


The system clock is derived from the embedded internal high-speed RC, no external . No external quartz is required for the bootloader execution.

### Bootloader selection

The figure below shows the bootloader selection mechanism.

**Figure** **88.** **Bootloader** **selection** **for** **STM32L1xxx6(8/B)** **devices**

### Bootloader version

The following table lists the STM32L1xxx6(8/B) devices bootloader versions:

**Table** **155.** **STM32L1xxx6(8/B)** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V2.0 | Initial bootloader version | When a Read Memory or Write Memory command is issued with an unsupported memory address and a correct address checksum (i.e. address 0x6000 0000), the command is aborted by the bootloader device, but the NACK (0x1F) is not sent to the host. As a result, the next two bytes (the number of bytes to be read/written and its checksum) are considered as a new command and its checksum.(1) PA13/14/15 is configured in alternate push-pull (PA14 in pull-down) even if not used. |

    1. If the “number of data - 1” (N-1) to be read/written is not equal to a valid command code, the limitation is not perceived from the host, as the command is NACK-ed anyway (as an unsupported new command).




### Bootloader configuration

The STM32L1xxxC bootloader is activated by applying Pattern 1 (described in [Table 2](#_bookmark7)). The following table shows the hardware resources used by this bootloader.

**Table** **156.** **STM32L1xxxC** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 16 MHz using the HSI. This is used only for USARTx and during USB detection for DFU (once the DFU is selected, the clock source is derived from the external crystal). |
|  |  | HSE enabled | The external clock is mandatory only for the DFU and must be in the following range: [24, 16, 12, 8, 6, 4, 3, 2] MHz. The PLL is used to generate the USB 48 MHz clock and the 32 MHz clock for the system clock. |
|  |  | - | The CSS interrupt is enabled for the DFU. Any failure (or removal) of the external clock generates a system reset. |
|  | RAM | - | 4 Kbytes, starting from address 0x20000000, are used by the bootloader firmware. |
|  | System memory | - | 8 Kbytes, starting from address 0x1FF00000 contains the bootloader firmware. |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value and is periodically refreshed to prevent watchdog resets (if the hardware IWDG option was previously enabled by the user). |
|  | Power | - | Voltage is set to Voltage Range 1. |
| USART1 | USART1 | Enabled | Once initialized, the USART1 configuration is 8 bits, even parity and 1 stop bit. |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. |



**Table** **156.** **STM32L1xxxC** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| USART2 | USART2 | Enabled | Once initialized, the USART2 configuration is 8 bits, even parity and 1 stop bit. The USART2 uses its remapped pins. |
|  | USART2_RX pin | Input | PD6 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PD5 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for the USARTx bootloader. |
| DFU | USB | Enabled | USB used in FS mode |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in input no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in input no pull mode. |


The system clock is derived from the embedded internal high-speed RC for the USARTx bootloader. This internal clock is also used the for DFU, but only for the selection phase. An external clock in the range of [24, 16, 12, 8, 6, 4, 3, 2] MHz is required for the execution of the DFU after the selection phase.




The figure below shows the bootloader selection mechanism.

**Figure** **89.** **Bootloader** **selection** **for** **STM32L1xxxC** **devices**

### Bootloader version

[Table 157](#_bookmark573)* *lists the STM32L1xxxC devices bootloader versions.

**Table** **157.** **STM32L1xxxC** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V4.0 | Initial bootloader version | For the USART interface, two consecutive instead of one NACKs are sent when a Read Memory or Write Memory command is sent and the RDP level is active. PA13/14/15 configured in alternate push-pull, pull (PA14 in pull-down) even if not used. The USB bootloader fails on some machines using a high speed controller. The bootloader is detected. but then data transaction fails. Root causes: De-synchronization between USB controller and bootloader SW due to the controller high speed transactions. Controller high speed inter-packet delay seems not sufficient for the bootloader SW (based on interrupt routines) to serve all needed transactions (the delay needed by the BL is nearly 25 µs). Some servicing IT are missed. This results in a communication fail, causing Write command to fail. Workarounds: Add an USB HUB between the host and the MCU. This relaxes transactions inter-packet delay, and allows the BL SW to perform correctly the task. Use USB controller/host that increase inter-packet delay. On new designs, use DFU SW that fix the issue in user flash memory. |





### Bootloader configuration

The STM32L1xxxD bootloader is activated by applying Pattern 4 (described in [Table 2](#_bookmark7)). The following table shows the hardware resources used by this bootloader.

**Table** **158.** **STM32L1xxxD** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 16 MHz using the HSI. This is used only for USARTx and during USB detection for DFU (once the DFU is selected, the clock source is derived from the external crystal). |
|  |  | HSE enabled | The external clock is mandatory only for DFU and it must be in the following range: [24, 16, 12, 8, 6, 4, 3, 2] MHz. The PLL is used to generate the USB 48 MHz clock and the 32 MHz clock for the system clock. |
|  |  | - | The CSS interrupt is enabled for the DFU. Any failure (or removal) of the external clock generates a system reset. |
|  | RAM | - | 4 Kbytes, starting from address 0x20000000, are used by the bootloader firmware. |
|  | System memory | - | 8 Kbytes, starting from address 0x1FF00000 contain the bootloader firmware. |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value and is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
|  | Power | - | Voltage is set to voltage range 1. |
| USART1 | USART1 | Enabled | Once initialized, the USART1 configuration is 8 bits, even parity, and one stop bit. |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. |



**Table** **158.** **STM32L1xxxD** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| USART2 | USART2 | Enabled | Once initialized, the USART2 configuration is 8 bits, even parity, and one stop bit. The USART2 uses its remapped pins. |
|  | USART2_RX pin | Input | PD6 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PD5 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx bootloader. |
| DFU | USB | Enabled | USB used in FS mode |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in alternate push-pull, no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in alternate push-pull, no pull mode. |


The system clock is derived from the embedded internal high-speed RC for USARTx bootloader. This internal clock is used also for DFU, but only for the selection phase. An external clock in the range of [24, 16, 12, 8, 6, 4, 3, 2] MHz is required for DFU execution after the selection phase.




The figure below shows the bootloader selection mechanism.

**Figure** **90.** **Bootloader** **selection** **for** **STM32L1xxxD** **devices**


### Bootloader version

The following table lists the STM32L1xxxD devices bootloader versions:

**Table** **159.** **STM32L1xxxD** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V4.1 | Initial bootloader version | In the bootloader code the PA13 (JTMS/SWDIO) I/O output speed is configured to 400 kHz, as a consequence some debugger cannot connect to the device in Serial Wire mode when the bootloader is running. When the DFU is selected, the RTC is reset and thus all RTC information (such as calendar, alarm) are lost including backup registers. Note: When the USART bootloader is selected there is no change on the RTC configuration (including backup registers). |
| V4.2 | Fix V4.1 limitations (available on Rev.Z devices only) | Stack overflow by 8 bytes when jumping to Bank1/Bank2 if BFB2 = 0 or when Read Protection level is set to 2. Workaround: the user code must force in the startup file the top of stack address before to jump to the main program. This can be done in the “Reset_Handler” routine. When the Stack of the user code is placed outside the SRAM (at 0x2000 C000) the bootloader cannot jump to that user code, considered invalid. This can happen with compilers that put the stack at a non-physical address at the top of the SRAM (at 0x2000 C000). Workaround: place manually the stack at a physical address. |
| V4.5 | Fix V4.2 limitations. DFU interface robustness enhancements (available on Rev.Y devices only). | For the USART interface, two consecutive NACKs (instead of one) are sent when a Read Memory or Write Memory command is sent and the RDP level is active. The USB bootloader fails on some machines using a high speed controller. The bootloader is detected. but then data transaction fails. Root causes: De-synchronization between USB controller and bootloader SW due to the controller high speed transactions. Controller high speed inter-packet delay seems not sufficient for the bootloader SW (based on interrupt routines) to serve all needed transactions (the delay needed by the BL is nearly 25 µs). Some servicing IT are missed. This results in a communication fail, causing Write command to fail. Workarounds: Add an USB HUB between the host and the MCU. This relaxes transactions inter-packet delay, and allows the BL SW to perform correctly the task. Use USB controller/host that increase inter-packet delay. On new designs, use DFU SW that fix the issue in user flash memory. |





### Bootloader configuration

The STM32L1xxxE bootloader is activated by applying Pattern 4 (described in [Table 2](#_bookmark7)). The following table shows the hardware resources used by this bootloader.

**Table** **160.** **STM32L1xxxE** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 16 MHz using the HSI. This is used only for USARTx and during USB detection for DFU (once the DFU is selected, the clock source is derived from the external crystal). |
|  |  | HSE enabled | The external clock is mandatory only for DFU and it must be in the following range: [24, 16, 12, 8, 6, 4, 3, 2] MHz. The PLL is used to generate the USB 48 MHz clock and the 32 MHz clock for the system clock. |
|  |  | - | The CSS interrupt is enabled for the DFU. Any failure (or removal) of the external clock generates system reset. |
|  | RAM | - | 4 Kbytes, starting from address 0x20000000, are used by the bootloader firmware. |
|  | System memory | - | 8 Kbytes, starting from address 0x1FF00000 contains the bootloader firmware. |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value and is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
|  | Power | - | Voltage is set to Voltage Range 1. |
| USART1 | USART1 | Enabled | Once initialized, the USART1 configuration is 8 bits, even parity, and one stop bit. |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. |



**Table** **160.** **STM32L1xxxE** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| USART2 | USART2 | Enabled | Once initialized, the USART2 configuration is 8 bits, even parity, and one stop bit. The USART2 uses its remapped pins. |
|  | USART2_RX pin | Input | PD6 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PD5 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx bootloader. |
| DFU | USB | Enabled | USB used in FS mode |
|  | USB_DM pin | Input/output | PA11: USB DM line. |
|  | USB_DP pin |  | PA12: USB DP line. |


The system clock is derived from the embedded internal high-speed RC for USARTx bootloader. This internal clock is used also for DFU, but only for the selection phase. An external clock in the range of [24, 16, 12, 8, 6, 4, 3, 2] MHz is required for DFU execution after the selection phase.




The figure below shows the bootloader selection mechanism.

**Figure** **91.** **Bootloader** **selection** **for** **STM32L1xxxE** **devices**

### Bootloader version

[Table 161](#_bookmark587)* *lists the STM32L1xxxE devices bootloader versions:

**Table** **161.** **STM32L1xxxE** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V4.0 | Initial bootloader version | For the USART interface, two consecutive NACKs (instead of 1 NACK) are sent when a Read Memory or Write Memory command is sent and the RDP level is active. PA13/14/15 configured in alternate push-pull, pull (PA14 in pull-down) even if not used. The USB bootloader fails on some machines using a high speed controller. The bootloader is detected. but then data transaction fails. Root causes: De-synchronization between USB controller and bootloader SW due to the controller high speed transactions. Controller high speed inter-packet delay seems not sufficient for the bootloader SW (based on interrupt routines) to serve all needed transactions (the delay needed by the BL is nearly 25 µs). Some servicing IT are missed. This results in a communication fail, causing Write command to fail. Workarounds: Add an USB HUB between the host and the MCU. This relaxes transactions inter-packet delay, and allows the BL SW to perform correctly the task. Use USB controller/host that increase inter-packet delay. On new designs, use DFU SW that fix the issue in user flash memory. |





### Bootloader configuration

The STM32L412xx/422xx bootloader is activated by applying Pattern 16 (described in
[Table 2](#_bookmark7)). [Table 162](#_bookmark590)* *shows the hardware resources used by this bootloader.

**Table** **162.** **STM32L412xx/422xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The HSI is used at startup as clock source for system clock configured to 72 MHz and for USART, I2C, SPI and USB bootloader operation. |
|  |  | - | CRS is enabled for the DFU to allow USB to be clocked by HSI48 48 MHz. |
|  | RAM | - | 12 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 28 Kbytes, starting from address 0x1FFF0000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
|  | Power | - | The DFU cannot be used to communicate with bootloader if the voltage scaling range 2 is selected. Bootloader firmware does not configure voltage scaling range value in PWR_CR1 register. |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in input no pull mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in input no pull mode. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in input pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Used in input pull-up mode |
| USART3 | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PC11 pin: USART3 in reception mode. Used in input pull-up mode. |
|  | USART3_TX pin | Output | PC10 pin: USART3 in transmission mode. Used in input pull-up mode. |



**Table** **162.** **STM32L412xx/422xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 1 MHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b1010010x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin | Input/output | PB7 pin: data line is used in open-drain no pull mode. |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 1 MHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b1010010x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PB10 pin: clock line is used in open-drain no pull mode. |
|  | I2C2_SDA pin | Input/output | PB11 pin: data line is used in open-drain no pull mode. |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 1 MHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b1010010x (x = 0 for write and x = 1 for read) |
|  | I2C3_SCL pin | Input/output | PC0 pin: clock line is used in open-drain no pull mode. |
|  | I2C3_SDA pin | Input/output | PC1 pin: data line is used in open-drain no pull mode. |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, pull-down mode.(1) |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in push-pull, pull-down mode. Note: This IO can be tied to GND if the SPI master does not use it. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware |
|  | SPI2_MOSI pin | Input | PB15 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI2_MISO pin | Output | PB14 pin: slave data output line, used in push-pull, pull-down mode.(1) |
|  | SPI2_SCK pin | Input | PB13 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI2_NSS pin | Input | PB12 pin: slave chip select pin used in push-pull, pull-down mode. Note: This IO can be tied to GND if the SPI master does not use it. |
| DFU | USB | Enabled | USB FS configured in forced device mode. USB FS interrupt vector is enabled and used for USB DFU communications. Note: VDDUSB IO must be connected to 3.3 V as USB peripheral is used by the bootloader. |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in alternate push-pull, no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in alternate push-pull, no pull mode. No external pull-up resistor is required |

1. SPI Tx (MISO) is handled by DMA. On the bootloader statup after SPI initialisation as soon as the bit DMATx enable on SPI CR2 register is set to 0x1, the MISO line will be set to 3.3 V.

*Note:**	If VDDUSB pin is not connected to V**DD**, SPI flash memory write operations may be** corrupted** **due** **to** **voltage** **issue.** **For** **more** **details,** **refer** **to** **product’s** **datasheet** **and** **errata **sheet.*

### Bootloader selection

The following figures show the bootloader selection mechanism.

**Figure** **92.** **Dual** **bank** **boot** **Implementation** **for** **STM32L412xx/422xx** **bootloader** **V9.x**















| Set Bank Swap to Bank2 |  |
| --- | --- |
|  |  |











| Set Bank Swap to Bank1 |  |
| --- | --- |
|  |  |






### Bootloader version

[Table 163](#_bookmark597)* *lists the STM32L412xx/422xx devices bootloader version.

**Table** **163.** **STM32L412xx/422xx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V13.1 | Initial bootloader version | On connection phase, USART responds with two ACK bytes (0x79) instead of one. PcROP option bytes cannot be written as Bootloader uses Byte access while PcROP must be accessed using half-word access. Workaround: load a code snippet in SRAM using Bootloader interface, then jump to it, and that code writes PcROP value. |





### Bootloader configuration

The bootloader V9.1 version is updated to fix known limitations relative to USB-DFU interface, and is implemented on devices with version information ID equal to 0x10 (refer to [Table 165](#_bookmark606)* *for more details).
The STM32L43xxx/44xxx bootloader is activated by applying Pattern 16 (described in
[Table 2](#_bookmark7)). [Table 164](#_bookmark600)* *shows the hardware resources used by this bootloader.

**Table** **164.** **STM32L43xxx/44xxx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The HSI is used at startup as clock source for system clock configured to 60 MHz and for USART, I2C, SPI and USB bootloader operation. |
|  |  | - | CRS is enabled for the DFU to allow USB to be clocked by HSI48 48 MHz. |
|  |  | HSE enabled | The HSE is used only when the CAN interface is selected. The HSE must have one of the following values [24,20,18,16,12,9,8,6,4] MHz. |
|  |  | - | The CSS interrupt is enabled when HSE is enabled. Any failure (or removal) of the external clock generates system reset |
|  | RAM | - | 12 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 28 Kbytes, starting from address 0x1FFF0000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
|  | Power | - | The DFU cannot be used to communicate with bootloader if the voltage scaling range 2 is selected. Bootloader firmware does not configure voltage scaling range value in PWR_CR1 register. |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in input no pull mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in input no pull mode. |



**Table** **164.** **STM32L43xxx/44xxx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in input pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Used in input pull-up mode. |
| USART3 | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PC11 pin: USART3 in reception mode. Used in input pull-up mode. |
|  | USART3_TX pin | Output | PC10 pin: USART3 in transmission mode |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 1 MHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b1001000x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin | Input/output | PB7 pin: data line is used in open-drain no pull mode. |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 1 MHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b1001000x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PB10 pin: clock line is used in open-drain no pull mode. |
|  | I2C2_SDA pin | Input/output | PB11 pin: data line is used in open-drain no pull mode. |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 1 MHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b1001000x (x = 0 for write and x = 1 for read) |
|  | I2C3_SCL pin | Input/output | PC0 pin: clock line is used in open-drain no pull mode. |
|  | I2C3_SDA pin | Input/output | PC1 pin: data line is used in open-drain no pull mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in push-pull, pull-down mode. Note: This IO can be tied to GND if the SPI master does not use it. |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware |
|  | SPI2_MOSI pin | Input | PB15 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI2_MISO pin | Output | PB14 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI2_SCK pin | Input | PB13 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI2_NSS pin | Input | PB12 pin: slave chip select pin used in push-pull, pull-down mode. Note: This IO can be tied to GND if the SPI master does not use it. |
| CAN1 | CAN1 | Enabled | Once initialized the CAN1 configuration is: Baudrate 125 kbps, 11 -bit identifier. |
|  | CAN1_RX pin | Input | PB8 pin: CAN1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | CAN1_TX pin | Output | PB9 pin: CAN1 in transmission mode. Used in alternate push-pull, pull-up mode. |
|  | TIM16 | Enabled | This timer is used to determine the value of the HSE. Once the HSE frequency is determined, the system clock is configured to 60 MHz using PLL and HSE. |



**Table** **164.** **STM32L43xxx/44xxx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| DFU | USB | Enabled | USB FS configured in forced device mode. USB FS interrupt vector is enabled and used for USB DFU communications. Note: VDDUSB IO must be connected to 3.3 V as USB peripheral is used by the bootloader. |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in alternate push-pull, no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in alternate push-pull, no pull mode. No external pull-up resistor is required |


*Note:**	If VDDUSB pin is not connected to V**DD**, SPI flash memory write operations may be** corrupted** **due** **to** **voltage** **issue.** **For** **more** **details,** **refer** **to** **product’s** **datasheet** **and** **errata **sheet.*
*SPI** **Tx** **(MISO)** **is** **handled** **by** **DMA.** **On** **the** **bootloader** **start-up** **after** **SPI** **initialization,** **as** soon** **as** **the** **bit** **DMATx** **enable** **on** **SPI** **CR2** **register** **is** **set** **to** **0x1,** **the** **MISO** **line** **is** **set** **to*
*3.3** **V.*

### Bootloader selection

The following figures show the bootloader selection mechanism.

**Figure** **94.** **Dual** **bank** **boot** **Implementation** **for** **STM32L3x2xx/44xxx** **bootloader** **V9.x**















| Set Bank Swap to Bank2 |  |
| --- | --- |
|  |  |











| Set Bank Swap to Bank1 |  |
| --- | --- |
|  |  |



**Figure** **95.** **Bootloader** **V9.x** **selection** **for** **STM32L43xxx/44xxx**



























| Disable all interrupt sources and other interfaces clocks |  |
| --- | --- |
|  |  |


























MSv38484V1

### Bootloader version

[Table 165](#_bookmark606)* *lists the STM32L43xxx/44xxx devices bootloader versions.

**Table** **165.** **STM32L43xxx/44xxx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V9.1 | Initial bootloader version | Check the Version Information ID of your STM32L43xxx/44xxx device, which can be read at 0x1FFF6FF2 address. Version Information ID equal to 0xFF: For memory write operations using DFU interface: If the buffer size is larger than 256 bytes and not multiple of 8 bytes, the write memory operation result is corrupted. Workaround: if the file size is larger than 256 bytes, add byte padding to align it on 8-bytes multiple size. For the USB-DFU interface, the CRS (clock recovery system) is not correctly configured and this may lead to random USB communication errors (depending on temperature and voltage). In most case communication error will manifest by a Stall response to setup packets. On the Go command, system bootloader de-init clears the RTCAPBEN bit in the RCC_APB1ENR register Workaround: manually call   HAL_RCC_RTC_CLK_ENABLE() in the software which sets the RTCAPBEN bit. Version Information ID equal to 0x10: None PcROP option bytes cannot be written as Bootloader uses Byte access while PcROP must be accessed using half-word access. Workaround: load a code snippet in SRAM using Bootloader interface then jump to it, and that code writes the PcROP value. |



**Table** **165.** **STM32L43xxx/44xxx** **bootloader** **versions** **(continued)**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V9.1 (continued) | Initial bootloader version (continued) | – SPI write operation fail Limitation: a. During bootloader SPI write flash memory operation, some random 64-bits (2 double-words) may be left blank at 0xFF. Root cause: Bootloader uses 64-bits cast write operation which is interrupted by SPI DMA and it leads to double access on same flash memory address and the 64-bits are not written. Workarounds: WA1: add a delay between sending write command and its ACK request. Its duration must be the duration of the 256-Bytes flash memory write time. WA2: read back after write and in case of error start write again. WA3: Patch in RAM to write in flash memory that implements write memory without 64-bits cast. WA1 and WA3 are more efficient than WA2 in terms of total programming time. How critical is the limitation: The limitation leads to a modification in customer SPI host software by adding 3-4 ms delay to each write operation. The delay is not waste because it is anyway the flash memory write period of time that host has to wait anyway (so instead of waiting by sending ACK requests, host will wait by delay). Limitation has been seen only on SPI and cannot impact USART/I2C/CAN – If the RTC is used by application prior to booting (through a system reset) on system bootloader, it is possible that CAN interface does not work correctly (cannot establish connection) unless a power cycle is performed or RTC is reset by application before booting on System Bootloader |





### Bootloader configuration

The STM32L45xxx/46xxx bootloader is activated by applying Pattern 16 (described in
[Table 2](#_bookmark7)). [Table 166](#_bookmark609)* *shows the hardware resources used by this bootloader.

**Table** **166.** **STM32L45xxx/46xxx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The HSI is used at startup as clock source for system clock configured to 72 MHz and for USART, I2C, SPI and USB bootloader operation. |
|  |  | - | CRS is enabled for the DFU to allow USB to be clocked by HSI48 48 MHz. |
|  |  | HSE enabled | The system clock frequency is 60 MHz. The HSE is used only when the CAN interface is selected. The HSE must have one of the following values [24,20,18,16,12,9,8,6,4] MHz. |
|  |  | - | The CSS interrupt is enabled when HSE is enabled. Any failure (or removal) of the external clock generates system reset |
|  | RAM | - | 12 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 28 Kbytes, starting from address 0x1FFF0000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
|  | Power | - | The DFU cannot be used to communicate with bootloader if the voltage scaling range 2 is selected. Bootloader firmware does not configure voltage scaling range value in PWR_CR1 register. |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in input no pull mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in input no pull mode. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in input pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Used in input pull-up mode. |



**Table** **166.** **STM32L45xxx/46xxx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| USART3 | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PC11 pin: USART3 in reception mode. Used in input pull-up mode. |
|  | USART3_TX pin | Output | PC10 pin: USART3 in transmission mode |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 1 MHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b1001010x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin | Input/output | PB7 pin: data line is used in open-drain no pull mode. |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 1 MHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b1001010x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PB10 pin: clock line is used in open-drain no pull mode. |
|  | I2C2_SDA pin | Input/output | PB11 pin: data line is used in open-drain no pull mode. |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 1 MHz, 7-bit address, Target mode, Analog filter ON Target 7-bit address: 0b1001010x (x = 0 for write and x = 1 for read) |
|  | I2C3_SCL pin | Input/output | PC0 pin: clock line is used in open-drain no pull mode. |
|  | I2C3_SDA pin | Input/output | PC1 pin: data line is used in open-drain no pull mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in push-pull, pull-down mode. Note: This IO can be tied to GND if the SPI master does not use it. |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PB15 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI2_MISO pin | Output | PB14 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI2_SCK pin | Input | PB13 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI2_NSS pin | Input | PB12 pin: slave chip select pin used in push-pull, pull-down mode. Note: This IO can be tied to GND if the SPI master does not use it. |
| CAN1 | CAN1 | Enabled | Once initialized the CAN1 configuration is: Baudrate 125 kbps, 11 -bit identifier. |
|  | CAN1_RX pin | Input | PB8 pin: CAN1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | CAN1_TX pin | Output | PB9 pin: CAN1 in transmission mode. Used in alternate push-pull, pull-up mode. |
|  | TIM16 | Enabled | This timer is used to determine the value of the HSE. Once the HSE frequency is determined, the system clock is configured to 60 MHz using PLL and HSE. |



**Table** **166.** **STM32L45xxx/46xxx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| DFU | USB | Enabled | USB FS configured in forced device mode. USB FS interrupt vector is enabled and used for USB DFU communications. Note: VDDUSB IO must be connected to 3.3 V as USB peripheral is used by the bootloader. |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in alternate push-pull, no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in alternate push-pull, no pull mode. No external pull-up resistor is required |


*Note:**	If VDDUSB pin is not connected to V**DD**, SPI flash memory write operations may be** corrupted** **due** **to** **voltage** **issue.** **For** **more** **details,** **refer** **to** **product’s** **datasheet** **and** **errata **sheet.*

### Bootloader selection

The following figures show the bootloader selection mechanism.

**Figure** **96.** **Dual** **bank** **boot** **implementation** **for** **STM32L45xxx/46xxx** **bootloader** **V9.x**















| Set Bank Swap to Bank2 |  |
| --- | --- |
|  |  |











| Set Bank Swap to Bank1 |  |
| --- | --- |
|  |  |



**Figure** **97.Bootloader** **V9.x** **selection** **for** **STM32L45xxx/46xxx**































| Disable all interrupt sources and other interfaces clocks |  |
| --- | --- |
|  |  |























MSv45964V1

### Bootloader version

[Table 167](#_bookmark615)* *lists the STM32L45xxx/46xxx devices bootloader versions.

**Table** **167.** **STM32L45xxx/46xxx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V9.2 | Initial bootloader version | PcROP option bytes cannot be written as Bootloader uses Byte access while PcROP must be accessed using half-word access. Workaround: load a code snippet in SRAM using Bootloader interface then jump to it, and that code writes the PcROP value. SPI write operation fail limitation: a. During Bootloader SPI write flash memory operation, some random 64-bits (2 double-words) may be left blank at 0xFF. Root cause: Bootloader uses 64-bits cast write operation which is interrupted by SPI DMA and it leads to double access on same flash memory address and the 64-bits are not written Workarounds: WA1: add a delay between sending write command and its ACK request. Its duration must be the duration of the 256-Bytes flash memory write time. WA2: read back after write and in case of error start write again. WA3: Patch in RAM to write in flash memory that implements write memory without 64-bits cast. WA1 and WA3 are more efficient than WA2 in terms of total programming time How critical is the limitation: The limitation leads to a modification in customer SPI host software by adding 3-4 ms delay to each write operation. The delay is not waste because it is anyway the flash memory write period of time that host has to wait anyway (so instead of waiting by sending ACK requests, host will wait by delay). Limitation has been seen only on SPI and cannot impact USART/I2C/CAN. |


## STM32L47xxx/48xxx devices


Two bootloader versions are available:
- V10.x supporting USART, I2C and DFU (USB FS device).
This version is embedded in STM32L47xxx/48xxx rev. 2 and rev. 3 devices.
- V9.x supporting USART, I2C, SPI, CAN and DFU (USB FS device). This version is embedded in STM32L47xxx/48xxx rev. 4 devices.


### Bootloader V10.x

#### Bootloader configuration

The STM32L47xxx/48xxx bootloader is activated by applying Pattern 7 (described in
[Table 2](#_bookmark7)). [Table 168](#_bookmark619)* *shows the hardware resources used by this bootloader.

**Table** **168.** **STM32L47xxx/48xxx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The HSI is used at startup as clock source for system clock configured to 24 MHz and for USART and I2C bootloader operation. |
|  |  | HSE enabled | The HSE is used only when the USB interface is selected and the LSE is not present. The HSE must have one of the following values: 24, 20, 18, 16, 12,9, 8, 6, and 4 MHz. |
|  |  | LSE enabled | The LSE is used to trim the MSI which is configured to 48 MHz as USB clock source. The LSE must be equal to 32.768 kHz. If the LSE is not detected, the HSE is used instead if USB is connected. |
|  |  | MSI enabled | The MSI is configured to 48 MHz and is used as USB clock source. The MSI is used only if LSE is detected, otherwise, HSE is used if USB is connected. |
|  |  | - | The CSS interrupt is enabled when LSE or HSE is enabled. Any failure (or removal) of the external clock generates system reset. |
|  | RAM | - | 12 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 28 Kbytes, starting from address 0x1FFF0000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
|  | Power | - | The DFU cannot be used to communicate with bootloader if the voltage scaling range 2 is selected. Bootloader firmware does not configure voltage scaling range value in PWR_CR1 register. |



**Table** **168.** **STM32L47xxx/48xxx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in input no pull mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in input no pull mode. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in input pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Used in input pull-up mode. |
| USART3 | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PC11 pin: USART3 in reception mode. Used i input pull-up mode. |
|  | USART3_TX pin | Output | PC10 pin: USART3 in transmission mode |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1000011x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin |  | PB7 pin: data line is used in open-drain no pull mode. |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1000011x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PB10 pin: clock line is used in open-drain no pull mode. |
|  | I2C2_SDA pin |  | PB11 pin: data line is used in open-drain no pull mode. |



**Table** **168.** **STM32L47xxx/48xxx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address is 0b1000011x (x = 0 for write and x = 1 for read) |
|  | I2C3_SCL pin | Input/output | PC0 pin: clock line is used in open-drain no pull mode. |
|  | I2C3_SDA pin |  | PC1 pin: data line is used in open-drain no pull mode. |
| DFU | USB | Enabled | USB OTG FS configured in forced device mode |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in alternate push-pull, no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in alternate push-pull, no pull mode. No external pull-up resistor is required |
|  | TIM17 | Enabled | This timer is used to determine the value of the HSE. Once the HSE frequency is determined, the system clock is configured to 24 MHz using PLL and HSE. |


For USARTx and I2Cx bootloaders no external clock is required.
USB bootloader (DFU) requires either an LSE (low-speed external clock) or a HSE (high-speed external clock):
      - If the LSE is present regardless of the HSE presence, the MSI is configured and trimmed by the LSE to provide an accurate clock equal to 48 MHz, which is the clock source of the USB. The system clock is kept clocked to 24 MHz by the HSI.
      - If the HSE is present, the system clock and USB clock are configured, respectively, to 24 MHz and 48 MHz with HSE as clock source.


#### Bootloader selection

[Figure 98](#_bookmark621)* *and [Figure 99](#_bookmark622)* *show the bootloader selection mechanism.

**Figure** **98.** **Dual** **bank** **boot** **implementation** **for** **STM32L47xxx/48xxx** **bootloader** **V10.x**


System Reset




If Boot0 = 0
no

yes




If Value of first address of Bank2 is within int. SRAM address


no


If Value of first address of Bank1 is within int. SRAM address

no


---


yes


---














yes


---

Protection level2 enabled

yes


If Value of first address of Bank2 is within int. SRAM address


no


---

no





yes



Protection level2 enabled


---


yes



no

MSv36786V1


**Figure** **99.Bootloader** **V10.x** **selection** **for** **STM32L47xxx/48xxx**



















| Disable all interrupt sources |  |
| --- | --- |
|  |  |


| Configure USARTx |  |
| --- | --- |
|  |  |






| Disable all interrupt sources |  |
| --- | --- |
|  |  |





























MSv38432V2


#### Bootloader version

[Table 169](#_bookmark624)* *lists the STM32L47xxx/48xxx devices bootloader V10.x versions:

**Table** **169.** **STM32L47xxx/48xxx** **bootloader** **V10.x** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V10.1 | Initial bootloader version | For memory write operations using DFU interface: If the buffer size is larger than 256 bytes and not multiple of 8 bytes, the write memory operation result is corrupted. Workaround: if the file size is larger than 256 bytes, add byte padding to align it on 8-bytes multiple size. Write in SRAM is corrupted. |
| V10.2 | Fix write in SRAM issue | For memory write operations using DFU interface: If the buffer size is larger than 256 bytes and not multiple of 8 bytes, the write memory operation result is corrupted. Workaround: if the file size is larger than 256 bytes, add byte padding to align it on 8-bytes multiple size. |
| V10.3 | Add support of MSI as USB clock source (MSI is trimmed by LSE). Update dual bank boot feature to support the case when user stack is mapped in SRAM2. | For memory write operations using DFU interface: If the buffer size is larger than 256 bytes and not multiple of 8 bytes, the write memory operation result is corrupted. Workaround: if the file size is larger than 256 bytes, add byte padding to align it on 8-bytes multiple size. PcROP option bytes cannot be written as Bootloader uses Byte access while PcROP must be accessed using half-word access. Workaround: load a code snippet in SRAM using the bootloader interface, then jump to it, and that code writes the PcROP value. |


### Bootloader V9.x

#### Bootloader configuration

The STM32L47xxx/48xxx bootloader is activated by applying Pattern 7 (described in
[Table 2](#_bookmark7)). [Table 170](#_bookmark627)* *shows the hardware resources used by this bootloader.

**Table** **170.** **STM32L47xxx/48xxx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The HSI is used at startup as clock source for system clock configured to 72 MHz and for USART and I2C bootloader operation. |
|  |  | HSE enabled | The HSE is used only when the USB interface is selected and the LSE is not present. The HSE must have one of the following values: 24, 20, 18, 16, 12, 8, 6, 4 MHz. System is clocked at 72 MHz if USB is used or 60 MHz if CAN is used. |
|  |  | LSE enabled | The LSE is used to trim the MSI which is configured to 48 MHz as USB clock source. The LSE must be equal to 32.768 kHz. If the LSE is not detected, the HSE is used instead if USB is connected. |
|  |  | MSI enabled | The MSI is configured to 48 MHz and is used as USB clock source. The MSI is used only if LSE is detected, otherwise, HSE is used if USB is connected. |
|  |  | CSS | The CSS interrupt is enabled when LSE or HSE is enabled. Any failure (or removal) of the external clock generates system reset. |
|  | RAM | - | 13 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 28 Kbytes, starting from address 0x1FFF0000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
|  | Power | - | The DFU cannot be used to communicate with bootloader if the voltage scaling range 2 is selected. Bootloader firmware does not configure voltage scaling range value in PWR_CR1 register. |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in input no pull mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in input no pull mode. |



**Table** **170.** **STM32L47xxx/48xxx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in input pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Used in input pull-up mode. |
| USART3 | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PC11 pin: USART3 in reception mode. Used in input pull-up mode. |
|  | USART3_TX pin | Output | PC10 pin: USART3 in transmission mode Used in input pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1000011x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin |  | PB7 pin: data line is used in open-drain no pull mode. |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1000011x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PB10 pin: clock line is used in open-drain no pull mode. |
|  | I2C2_SDA pin |  | PB11 pin: data line is used in open-drain no pull mode. |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1000011x (x = 0 for write and x = 1 for read) |
|  | I2C3_SCL pin | Input/output | PC0 pin: clock line is used in open-drain no pull mode. |
|  | I2C3_SDA pin |  | PC1 pin: data line is used in open-drain no pull mode. |



**Table** **170.** **STM32L47xxx/48xxx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, pull-down mode(1) |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI1_NSS pin |  | PA4 pin: slave chip select pin used in push-pull, pull-down mode. |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware |
|  | SPI2_MOSI pin | Input | PB15 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI2_MISO pin | Output | PB14 pin: slave data output line, used in push-pull, pull-down mode(1) |
|  | SPI2_SCK pin | Input | PB13 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI2_NSS pin |  | PB12 pin: slave chip select pin used in push-pull, pull-down mode. |
| CAN1 | CAN1 | Enabled | Once initialized the CAN1 configuration is: Baudrate 125 kbps, 11-bit identifier. |
|  | CAN1_RX pin | Input | PB8 pin: CAN1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | CAN1_TX pin | Output | PB9 pin: CAN1 in transmission mode. Used in alternate push-pull, pull-up mode. |
| DFU | USB | Enabled | USB FS configured in forced device mode. USB FS interrupt vector is enabled and used for USB DFU communications. Note: VDDUSB IO must be connected to 3.3 V as USB peripheral is used by the bootloader. |
|  | USB_DM pin | Input/output | PA11 pin: USB FS DM line. Used in alternate push-pull, no pull mode. |
|  | USB_DP pin |  | PA12 pin: USB FS DP line. Used in alternate push-pull, no pull mode. No external pull-up resistor is required. |

1. SPI Tx (MISO) is handled by DMA. On the bootloader start-up after SPI initialization, as soon as the bit DMATx enable on SPI CR2 register is set to 0x1, the MISO line is set to 3.3 V.


If the HSE is present, the system clock and USB clock are configured, respectively, to 72 and 48 MHz with PLL (clocked by HSE) as a clock source.
*Note:**	If VDDUSB pin is not connected to V**DD**, SPI flash memory write operations may be** corrupted** **due** **to** **voltage** **issue.** **For** **more** **details,** **refer** **to** **product’s** **datasheet** **and** **errata **sheet.*

#### Bootloader selection

[Figure 100](#_bookmark631)* *and [Figure 101](#_bookmark632)* *show the bootloader selection mechanism.

**Figure** **100.** **Dual** **bank** **boot** **implementation** **for** **STM32L47xxx/48xxx** **bootloader** **V9.x**


System Reset




If Boot0 = 0
no

yes




If Value of first address of Bank2 is within int. SRAM address


no


If Value of first address of Bank1 is within int. SRAM address

no


---


yes


---














yes


---

Protection level2 enabled

yes


If Value of first address of Bank2 is within int. SRAM address


no


---

no





yes



Protection
level2 enabled


---

yes



no

MSv36786V1


**Figure** **101.Bootloader** **V9.x** **selection** **for** **STM32L47xxx/48xxx**





















| Disable all interrupt sources and other interfaces clocks |  | Disable all interrupt sources and other interfaces clocks |
| --- | --- | --- |
|  |  |  |















































MSv38404V1


#### Bootloader version

[Table 171](#_bookmark634)* *lists the STM32L47xxx/48xxx devices bootloader V9.x versions:

**Table** **171.** **STM32L47xxx/48xxx** **bootloader** **V9.x** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V9.0 | Initial bootloader version | For memory write operations using DFU interface: If the buffer size is larger than 256 bytes and not multiple of 8 bytes, the write memory operation result is corrupted. Workaround: if the file size is larger than 256 bytes, add byte padding to align it on 8-bytes multiple size. Write in SRAM is corrupted |
| V9.1 | Deprecated version (not used) | None |
| V9.2 | Fix write in SRAM issue | For memory write operations using DFU interface: If the buffer size is larger than 256 bytes and not multiple of 8 bytes, the write memory operation result is corrupted. Workaround: if the file size is larger than 256 bytes, add byte padding to align it on 8-bytes multiple size.  PcROP option bytes cannot be written as the bootloader uses byte access while PcROP must be accessed using half-word access. Workaround: load a code snippet in SRAM using Bootloader interface then jump to it, and that code writes the PcROP value.  During bootloader SPI write flash memory operation, some random 64 bits (2 double-words) may be left blank at 0xFF. Root cause: the bootloader uses 64-bit cast write operation, interrupted by SPI DMA. This leads to double access on same flash memory address, and the 64 bits are not written. Workarounds: WA1: add a delay between sending write command and its ACK request. Its duration must be the duration of the 256-byte flash memory write time. WA2: read back after write, and, in case of error, start write again. WA3: patch in RAM to write in flash memory that implements write without 64-bit cast. WA1 and WA3 are more efficient than WA2 in terms of total programming time. The limitation leads to a modification in customer SPI host software by adding 3-4 ms delay to each write operation. This time is not lost, because it is anyway the flash memory write time, the host must wait anyway (so instead of waiting by sending ACK requests, host waits by delay). Limitation has been seen only on SPI and cannot impact USART/I2C/CAN/USB. |


## STM32L496xx/4A6xx devices


### Bootloader configuration

The STM32L496xx/4A6xx bootloader is activated by applying Pattern 6 (described in
[Table 2](#_bookmark7)). [Table 172](#_bookmark637)* *shows the hardware resources used by this bootloader.

**Table** **172.** **STM32L496xx/4A6xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The HSI is used at startup as clock source for system clock configured to 72 MHz and for USART, I2C and SPI bootloader operation. |
|  |  | - | CRS is enabled for the DFU to allow USB to be clocked by HSI 48 MHz. |
|  |  | HSE enabled | The HSE is used only when the CAN interface is selected. The HSE must have one of the following values: 24,20,18,16,12,9,8,6,4 MHz. |
|  |  | - | The CSS interrupt is enabled when HSE is enabled. Any failure (or removal) of the external clock generates system reset |
|  | RAM | - | 12 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 28 Kbytes, starting from address 0x1FFF0000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
|  | Power | - | The DFU cannot be used to communicate with bootloader if voltage scaling range 2 is selected. Bootloader firmware does not configure voltage scaling range value in PWR_CR1 register. |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in input no pull mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in input no pull mode. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in input no pull mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Used in input no pull mode. |



**Table** **172.** **STM32L496xx/4A6xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| USART3 | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PC11 pin: USART3 in reception mode. Used in input no pull mode. |
|  | USART3_TX pin | Output | PC10 pin: USART3 in transmission mode. Used in input no pull mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1001100x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin |  | PB7 pin: data line is used in open-drain no pull mode. |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1001100x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PB10 pin: clock line is used in open-drain no pull mode. |
|  | I2C2_SDA pin |  | PB11 pin: data line is used in open-drain no pull mode. |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1001100x (x = 0 for write and x = 1 for read) |
|  | I2C3_SCL pin | Input/output | PC0 pin: clock line is used in open-drain no pull mode. |
|  | I2C3_SDA pin |  | PC1 pin: data line is used in open-drain no pull mode. |



**Table** **172.** **STM32L496xx/4A6xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in push-pull, pull-down mode. Note: This IO can be tied to GND if the SPI master does not use it. |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PB15 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI2_MISO pin | Output | PB14 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI2_SCK pin | Input | PB13 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI2_NSS pin | Input | PB12 pin: slave chip select pin used in push-pull, pull-down mode. Note: This IO can be tied to GND if the SPI master does not use it. |
| CAN1 | CAN1 | Enabled | Once initialized the CAN1 configuration is:Baudrate 125 kbps, 11 -bit identifier. |
|  | CAN1_RX pin | Input | PB8 pin: CAN1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | CAN1_TX pin | Output | PB9 pin: CAN1 in transmission mode. Used in alternate push-pull, pull-up mode. |
|  | TIM16 | Enabled | This timer is used to determine the value of the HSE. Once the HSE frequency is determined, the system clock is configured to 60 MHz using PLL and HSE. |



**Table** **172.** **STM32L496xx/4A6xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| DFU | USB | Enabled | USB OTG FS configured in forced device mode. USB OTG FS interrupt vector is enabled and used for USB DFU communications. Note: VDDUSB IO must be connected to 3.3 V as USB peripheral is used by the bootloader. |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in alternate push-pull, no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in alternate push-pull, no pull mode. No external pull-up resistor is required |


*Note:**	If VDDUSB pin is not connected to V**DD**, SPI flash memory write operations may be** corrupted** **due** **to** **voltage** **issue.** **For** **more** **details,** **refer** **to** **product’s** **datasheet** **and** **errata **sheet.*

### Bootloader selection

The figures below show the bootloader selection mechanism.

**Figure** **102.** **Dual** **bank** **boot** **Implementation** **for** **STM32L496xx/4A6xx** **bootloader** **V9.x**















| Set Bank Swap to Bank2 |  |
| --- | --- |
|  |  |











| Set Bank Swap to Bank1 |  |
| --- | --- |
|  |  |



**Figure** **103.Bootloader** **V9.x** **selection** **for** **STM32L496xx/4A6xx**































| Disable all interrupt |  |
| --- | --- |
| sources and other |  |
| interfaces clocks |  |
|  |  |


| Reconfigure System clock to 60 MHz |  |
| --- | --- |
|  |  |


### Bootloader version

[Table 173](#_bookmark643)* *lists the STM32L496xx/4A6xx devices bootloader versions.

**Table** **173.** **STM32L496xx/4A6xx** **bootloader** **version**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V9.3 | Initial bootloader version | The Bank Erase command is aborted by the bootloader device, and the NACK (0x1F) is sent to the host. Workaround: Perform Bank erase operation through page erase using the Erase command (0x44). SPI write operation fail Limitation: a. During Bootloader SPI write flash memory operation, some random 64-bits (2 double-words) may be left blank at 0xFF. Root cause: Bootloader uses 64-bits cast write operation which is interrupted by SPI DMA and it leads to double access on same flash memory address and the 64-bits are not written Workarounds: WA1: add a delay between sending write command and its ACK request. Its duration must be the duration of the 256-Bytes flash memory write time. WA2: read back after write and in case of error start write again. WA3: Patch in RAM to write in flash memory that implements write memory without 64-bits cast. WA1 and WA3 are more efficient than WA2 in terms of total programming time How critical is the limitation: The limitation leads to a modification in customer SPI host software by adding 3-4 ms delay to each write operation. The delay is not waste because it is anyway the flash memory write period of time that host has to wait anyway (so instead of waiting by sending ACK requests, host will wait by delay). Limitation has been seen only on SPI and cannot impact USART/I2C/CAN. – PcROP option bytes cannot be written as Bootloader uses Byte access while PcROP must be accessed using half-word access. Workaround: load a code snippet in SRAM using Bootloader interface then jump to it, and that code writes the PcROP value. |


## STM32L4P5xx/4Q5xx devices


### Bootloader configuration

The STM32L4P5xx/4Q5xx bootloader is activated by applying Pattern 7 (described in
[Table 2](#_bookmark7)). [Table 176](#_bookmark654)* *shows the hardware resources used by this bootloader.

**Table** **174.** **STM32L4P5xx/4Q5xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The HSI is used at startup as clock source for system clock configured to 60 MHz and for USART, I2C, SPI and USB bootloader operation. |
|  |  | - | CRS is enabled for the DFU to allow USB to be clocked by HSI 48 MHz. |
|  |  | HSE enabled | The HSE is used only when the CAN interface is selected. The HSE must have one of the following values 24, 20, 18, 16, 12, 9, 8, 6, 4 MHz. |
|  |  | - | The CSS interrupt is enabled when HSE is enabled. Any failure (or removal) of the external clock generates system reset |
|  | RAM | - | 16 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 28 Kbytes, starting from address 0x1FFF0000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
|  | Power | - | The DFU cannot be used to communicate with bootloader if the voltage scaling range 2 is selected. Bootloader firmware does not configure voltage scaling range value in PWR_CR1 register. |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in input no pull mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in input no pull mode. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in input pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode |



**Table** **174.** **STM32L4P5xx/4Q5xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| USART3 | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PC11 pin: USART3 in reception mode. Used in input pull-up mode. |
|  | USART3_TX pin | Output | PC10 pin: USART3 in transmission mode. Used in input pull-up mode. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1011011x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin |  | PB7 pin: data line is used in open-drain no pull mode. |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1011011x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PB10 pin: clock line is used in open-drain no pull mode. |
|  | I2C2_SDA pin |  | PB11 pin: data line is used in open-drain no pull mode. |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1011011x (x = 0 for write and x = 1 for read) |
|  | I2C3_SCL pin | Input/output | PC0 pin: clock line is used in open-drain no pull mode. |
|  | I2C3_SDA pin |  | PC1 pin: data line is used in open-drain no pull mode. |



**Table** **174.** **STM32L4P5xx/4Q5xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in push-pull, pull-down mode. Note: This IO can be tied to GND if the SPI master does not use it. |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PB15 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI2_MISO pin | Output | PB14 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI2_SCK pin | Input | PB13 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI2_NSS pin | Input | PB12 pin: slave chip select pin used in push-pull, pull-down mode. Note: This IO can be tied to GND if the SPI master does not use it. |
| CAN1 | CAN1 | Enabled | Once initialized the CAN1 configuration is: Baudrate 125 kbps, 11 -bit identifier. |
|  | CAN1_RX pin | Input | PB8 pin: CAN1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | CAN1_TX pin | Output | PB9 pin: CAN1 in transmission mode. Used in alternate push-pull, pull-up mode. |



**Table** **174.** **STM32L4P5xx/4Q5xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| DFU | USB | Enabled | USB FS configured in forced device mode. USB FS interrupt vector is enabled and used for USB DFU communications. Note: VDDUSB IO must be connected to 3.3 V as USB peripheral is used by the bootloader. |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in alternate push-pull, no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in alternate push-pull, no pull mode. No external pull-up resistor is required |


### Bootloader selection

[Figure 106](#_bookmark656)* *and [Figure 107](#_bookmark657)* *show the bootloader selection mechanisms.

**Figure** **104.** **Dual** **bank** **boot** **implementation** **for** **STM32L4P5xx/4Q5xx** **bootloader** **V9.x**


System Reset




If Boot0 = 0
no

yes




If Value of first address of Bank2 is within int. SRAM address


no


If Value of first address of Bank1 is within int. SRAM address

no


---


yes


---














yes


---

Protection level2 enabled

yes


If Value of first address of Bank2 is within int. SRAM address


no


---

no





yes



Protection
level2 enabled


---

yes



no

MSv36786V1


**Figure** **105.Bootloader** **V9.x** **selection** **for** **STM32L4P5xx/4Q5xx**

System Reset


Configure System clock to 60 MHz with HSI


System Init (Clock, GPIOs, IWDG, SysTick)




Configure SPIx



0x7F received on USARTx


no


---



yes


---



Disable all interrupt sources and other interfaces clocks


---



Disable all interrupt sources and other interfaces clocks


---

Disable all interrupt sources and other interfaces clocks


Configure USARTx



I2C Address Detected


---


yes


---

Execute BL_SPI_Loop for SPIx


---

Execute BL_I2C_Loop for I2Cx


no



Synchro mechanism detected on SPIx


no
no
Frame detected on CANx


---







yes


---


yes


---

HSE detected	no

yes


Reconfigure System clock to 60 MHz



no


USB cable Detected


---





yes


---




Execute DFU bootloader using USB interrupts


---

Configure CAN




MS49689V1

### Bootloader version

[Table 175](#_bookmark651)* *lists the STM32L4P5xx/4Q5xx devices bootloader versions.

**Table** **175.** **STM32L4P5xx/4Q5xx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V9.0 | Initial bootloader version on cut 1.0 samples | – PcROP option bytes cannot be written as bootloader uses byte access while PcROP must be accessed using half-word access. Workaround: load a code snippet in SRAM using bootloader interface then jump to it, and that code writes PcROP value. |


## STM32L4Rxxx/4Sxxx devices


### Bootloader configuration

The STM32L4Rxx/4Sxx bootloader is activated by applying Pattern 6 (described in [Table 2](#_bookmark7)). [Table 176](#_bookmark654)* *shows the hardware resources used by this bootloader.

**Table** **176.** **STM32L4Rxxx/4Sxxx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The HSI is used at startup as clock source for system clock configured to 60 MHz and for USART, I2C, SPI and USB bootloader operation. |
|  |  | - | CRS is enabled for the DFU to allow USB to be clocked by HSI 48 MHz. |
|  |  | HSE enabled | The HSE is used only when the CAN interface is selected. The HSE must have one of the following values: 24, 20, 18, 16, 12, 9, 8, 6, 4 MHz. |
|  |  | - | The CSS interrupt is enabled when HSE is enabled. Any failure (or removal) of the external clock generates system reset. |
|  | RAM | - | 12 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 28672 bytes starting from address 0x1FFF0000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
|  | Power | - | The DFU cannot be used to communicate with bootloader if the voltage scaling range 2 is selected. Bootloader firmware does not configure voltage scaling range value in PWR_CR1 register. |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in input no pull mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in input no pull mode. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in input pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Used in input pull-up mode. |



**Table** **176.** **STM32L4Rxxx/4Sxxx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| USART3 | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PC11 pin: USART3 in reception mode. Used in input pull-up mode. |
|  | USART3_TX pin | Output | PC10 pin: USART3 in transmission mode. Used in input pull-up mode. |
| USARTx | SysTick timer | Enabled | Used to automatically detect the serial baud rate from the host for USARTx. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1010000x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin | Input/output | PB7 pin: data line is used in open-drain no pull mode. |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1010000x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PB10 pin: clock line is used in open-drain no pull mode. |
|  | I2C2_SDA pin | Input/output | PB11 pin: data line is used in open-drain no pull mode. |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1010000x (x = 0 for write and x = 1 for read) |
|  | I2C3_SCL pin | Input/output | PC0 pin: clock line is used in open-drain no pull mode. |
|  | I2C3_SDA pin | Input/output | PC1 pin: data line is used in open-drain no pull mode. |



**Table** **176.** **STM32L4Rxxx/4Sxxx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in push-pull, pull-down mode. Note: This IO can be tied to GND if the SPI master does not use it. |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PB15 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI2_MISO pin | Output | PB14 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI2_SCK pin | Input | PB13 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI2_NSS pin | Input | PB12 pin: slave chip select pin used in push-pull, pull-down mode. Note: This IO can be tied to GND if the SPI master does not use it. |
| CAN1 | CAN1 | Enabled | Once initialized the CAN1 configuration is: Baudrate 125 kbps, 11 -bit identifier. |
|  | CAN1_RX pin | Input | PB8 pin: CAN1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | CAN1_TX pin | Output | PB9 pin: CAN1 in transmission mode. Used in alternate push-pull, pull-up mode. |
|  | TIM16 | Enabled | This timer is used to determine the value of the HSE. Once the HSE frequency is determined, the system clock is configured to 60 MHz using PLL and HSE. |



**Table** **176.** **STM32L4Rxxx/4Sxxx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| DFU | USB | Enabled | USB FS configured in forced device mode. USB FS interrupt vector is enabled and used for USB DFU communications. Note: VDDUSB IO must be connected to 3.3 V as USB peripheral is used by the bootloader. |
|  | USB_DM pin | Input/output | PA11: USB DM line. |
|  | USB_DP pin |  | PA12: USB DP line No external pull-up resistor is required |


### Bootloader selection

[Figure 106](#_bookmark656)* *and [Figure 107](#_bookmark657)* *show the bootloader selection mechanisms.

**Figure** **106.** **Dual** **bank** **boot** **implementation** **for** **STM32L4Rxxx/STM32L4Sxxx** **bootloader** **V9.x**


System Reset




If Boot0 = 0
no

yes




If Value of first address of Bank2 is within int. SRAM address


no


If Value of first address of Bank1 is within int. SRAM address

no


---


yes


---














yes


---

Protection level2 enabled

yes


If Value of first address of Bank2 is within int. SRAM address


no


---

no





yes



Protection
level2 enabled


---

yes



no

MSv36786V1


**Figure** **107.Bootloader** **V9.x** **selection** **for** **STM32L4Rxx/4Sxx**

System Reset


Configure System clock to 60 MHz with HSI


System Init (Clock, GPIOs, IWDG, SysTick)




Configure SPIx



0x7F received on USARTx


no


---



yes


---



Disable all interrupt sources and other interfaces clocks


---



Disable all interrupt sources and other interfaces clocks


---

Disable all interrupt sources and other interfaces clocks


Configure USARTx



I2C Address Detected


---


yes


---

Execute BL_SPI_Loop for SPIx


---

Execute BL_I2C_Loop for I2Cx


no



Synchro mechanism detected on SPIx


no
no
Frame detected on CANx


---







yes


---


yes


---

HSE detected	no

yes


Reconfigure System clock to 60 MHz



no


USB cable Detected


---





yes


---




Execute DFU bootloader using USB interrupts


---

Configure CAN




MS49689V1

### Bootloader version

[Table 177](#_bookmark659)* *lists the STM32L4Rxx/4Sxx devices bootloader versions.

**Table** **177.** **STM32L4Rxx/4Sxx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V9.0 | Initial bootloader version on cut 1.0 samples | None |


## STM32L552xx/62xx devices


### Bootloader configuration

The STM32L552xx/62xx bootloader is activated by applying Pattern 12 (described in
[Table 2](#_bookmark7)). [Table 178](#_bookmark662)* *shows the hardware resources used by this bootloader.
The bootloader follows boot model V3_1 (see [Section 4.10](#_bookmark35)), so it inherits all its constraints.

**Table** **178.** **STM32L552xx/62xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 60 MHz (using PLL clocked by HSI). |
|  |  | - | CRS is enabled for the DFU to allow USB to be clocked by HSI 48 MHz. |
|  |  | - | 20 MHz derived from the PLLQ is used for FDCAN |
|  | RAM | - | 16 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 32 Kbytes, starting from address 0x0BF90000. |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART3 | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PC11 pin: USART3 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART3_TX pin | Output | PC10 pin: USART3 in transmission mode. Used in alternate push-pull, pull-up mode. |



**Table** **178.** **STM32L552xx/62xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b0101100x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain pull-up mode. |
|  | I2C1_SDA pin |  | PB7 pin: data line is used in open-drain pull-up mode. |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b0101100x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PB10 pin: clock line is used in open-drain pull-up mode. |
|  | I2C2_SDA pin |  | PB11 pin: data line is used in open-drain pull-up mode. |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b0101100x (x = 0 for write and x = 1 for read) |
|  | I2C3_SCL pin | Input/output | PC0 pin: clock line is used in open-drain pull-up mode. |
|  | I2C3_SDA pin |  | PC1 pin: data line is used in open-drain pull-up mode. |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in push-pull, pull-down mode. Note: This IO can be tied to GND if the SPI master does not use it. |



**Table** **178.** **STM32L552xx/62xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PB15 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI2_MISO pin | Output | PB14 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI2_SCK pin | Input | PB13 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI2_NSS pin | Input | PB12 pin: slave chip select pin used in push-pull, pull-down mode. Note: This IO can be tied to GND if the SPI master does not use it. |
| SPI3 | SPI3 | Enabled | The SPI configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI3_MOSI pin | Input | PB5 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI3_MISO pin | Output | PG10 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI3_SCK pin | Input | PG9 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI3_NSS pin | Input | PG12 pin: slave chip select pin used in push-pull, pull-down mode. Note: This IO can be tied to GND if the SPI master does not use it. |
| FDCAN | FDCAN1 | Enabled | Once initialized the FDCAN1 configuration is: Connection bit rate 250 kbit/s Data bit rate 1000 kbit/s FrameFormat = FDCAN_FRAME_FD_BRS Mode = FDCAN_MODE_NORMAL AutoRetransmission = ENABLE TransmitPause = DISABLE ProtocolException = ENABLE |
|  | FDCAN1_Rx pin | Input/ | PB9 pin: FDCAN1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | FDCAN1_Tx pin | Output | PB8 pin: FDCAN1 in transmission mode. Used in alternate push-pull, pull-up mode. |



**Table** **178.** **STM32L552xx/62xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| DFU | USB | Enabled | USB FS configured in forced device mode. USB FS interrupt vector is enabled and used for USB DFU communications. Note: VDDUSB IO must be connected to 3.3 V as USB peripheral is used by the bootloader. |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in input no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in input no pull mode. No external pull-up resistor is required |


**Table** **179.** **STM32L552xx/62xx** **special** **commands**
| Special commands supported (USART/I2C/SPI/FDCAN) Opcode - 0x50 |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Function | Sub-Opcode (2 bytes) | Number of data sent (2 bytes) | Data sent | Number of data received | Data received | Number of status data received (2 bytes) | Status data received |
| TrustZone disable Must be run when TZEN = 1 and RDP = 1 | 0x82 | 0x4 | 0x0 | 0x0 | NA | 0x1 | 0x0 |
| Regression from RDP L1 to RDP 0.5 Must be run when TZEN = 1 and RDP = 1 | 0x82 | 0x4 | 0x1 | 0x0 | NA | 0x1 | 0x0 |


*Note:**	USB** **special** **commands** **are** **slightly** **different** **from** **the** **other** **protocols** **as** **per** **the** **USB** protocol specificities:*
- *No** **Opcode** **is** **used,** **Sub-Opcode** **is** **used** **directly*
- *Sub-Opcode** **is** **treated** **in** **a** **single** **byte** **and** **not** **two** **bytes*
- *Data** **are** **sent** **on** **USB** **frame** **byte** **per** **byte.** **No** **need** **to** **add** **number** **of** **data** **to** **be** **transmitted*
- *Returned** **data** **and** **status** **are** **formatted** **on** **the** **USB** **native** **protocol*

### Bootloader selection

[Figure 108](#_bookmark665)* *shows the bootloader selection mechanism.

**Figure** **108.** **Bootloader** **V9.x** **selection** **for** **STM32L552xx/62xx**

### Bootloader version

[Table 180](#_bookmark667)* *lists the STM32L552xx/62xx devices bootloader versions.

**Table** **180.** **STM32L552xx/62xx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V13.0 | Initial bootloader version on cut1.0 samples | USART3 not working SPI3 not working OB launch not working on USB-DFU No read/write SRAM2 in all protocols Read Secure Option bytes only implemented on USART/I2C Regression from TZEN = 1 to TZEN = 0 is done automatically on RDP regression |
| V9.0 | Release supported only in cut2.0 – Fix all issues on previous release Add FDCAN support New command added for TZEN disable Support of sales type 256 KB | Unable to set TZEN to 1 option byte using all interfaces of the BL No workarounds available Cannot set RDP level 0.5 nor option bytes in RDP level 0.5 using BL interfaces No workarounds available Multiple reset seen when enabling HW IWDG option byte in TZEN = 1 No workarounds available Unable to set secure option bytes setting when TZEN = 1 and RDP level is 0 No workarounds available Go command on USB is not working FDCAN erase not working as page number endianness is not aligned with the protocol (device waits for LSB first but host sends MSB first) WA - Send data MSB first to the BL |
| V9.1 | Fix all known limitations of previous release Add enable BOOT_LOCK BL command Add support of RDP L1 to 0.5 regression | Option byte programming is not working properly when using FDCAN interface. This makes the change of the Option byte not effective until a power off/power on. FDCAN erase not working as page number endianness is not aligned with the protocol (device waits for LSB first but host sends MSB first) WA - Send data MSB first to the BL |
| V9.2 | Fix all known limitations of previous release Version for silicon revision Z | FDCAN Readout unprotect command does not send the command ID to the host |


*Note:**	When** **jumping** **to** **the** **BL** **the** **cache** **must** **be** **disabled.*




### Bootloader configuration

The STM32WB10xx/15xx bootloader is activated by applying Pattern 6 (described in
[Table 2](#_bookmark7)). [Table 183](#_bookmark677)* *shows the hardware resources used by this bootloader.

**Table** **181.** **STM32WB10xx/15xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | MSI enabled | The system clock frequency is 64 MHz (using PLL clocked by MSI). |
|  | RAM | - | 16 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 28 Kbytes, starting from address 0x1FFF0000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1001111x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin |  | PB7 pin: data line is used in open-drain no pull mode. |



**Table** **181.** **STM32WB10xx/15xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in push-pull, pull-down mode. Note: This IO can be tied to GND if the SPI master does not use it. |





[Figure 109](#_bookmark672)* *shows the bootloader selection mechanism.

**Figure** **109.** **Bootloader** **V11.x** **selection** **for** **STM32WB10xx/15xx**

### Bootloader version

**Table** **182.** **STM32WB10xx/15xx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V11.1 | Initial bootloader version | I2C Write Protect command (0x73) performs a Read Unprotect instead of disabling write protection. Workaround: Use No-Stretch Write Unprotect command (0x74) that is performing correctly the write unprotect operation |





### Bootloader configuration

The STM32WB30xx/35xx/50xx/55xx bootloader is activated by applying Pattern 16 (described in [Table 2](#_bookmark7)). [Table 183](#_bookmark677)* *shows the hardware resources used by this bootloader.

**Table** **183.** **STM32WB30xx/35xx/50xx/55xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | MSI enabled | The system clock frequency is 64 MHz (using PLL clocked by MSI). |
|  |  | - | CRS is enabled for the DFU to allow USB to be clocked by HSI 48 MHz. |
|  | RAM | - | 20 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 28 Kbytes, starting from address 0x1FFF0000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1001111x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin | Input/output | PB7 pin: data line is used in open-drain no pull mode. |



**Table** **183.** **STM32WB30xx/35xx/50xx/55xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1001111x (x = 0 for write and x = 1 for read) |
|  | I2C3_SCL pin | Input/output | PC0 pin: clock line is used in open-drain no pull mode. |
|  | I2C3_SDA pin | Input/output | PC1 pin: data line is used in open-drain no pull mode. |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in push-pull, pull-down mode. Note: This IO can be tied to GND if the SPI master does not use it. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PB15 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI2_MISO pin | Output | PB14 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI2_SCK pin | Input | PB13 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI2_NSS pin | Input | PB12 pin: slave chip select pin used in push-pull, pull-down mode. Note: This IO can be tied to GND if the SPI master does not use it. |
| DFU | USB | Enabled | USB FS configured in forced device mode. USB FS interrupt vector is enabled and used for USB DFU communications. Note: VDDUSB IO must be connected to 3.3 V as USB peripheral is used by the bootloader. |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in input no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in input no pull mode. No external pull-up resistor is required |


### Bootloader selection

[Figure 110](#_bookmark679)* *shows the bootloader selection mechanism.

**Figure** **110.** **Bootloader** **V13.0** **selection** **for** **STM32WB30xx/35xx/50xx/55xx**




**Table** **184.** **STM32WB30xx/35xx/50xx/55xx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V13.5 | Initial bootloader version | Readout Unprotect Command is not working properly as at the end of the command an NVIC_SystemReset is done instead of a flash option bytes reload. This makes the change of the RDP level not effective until a power off/on. I2C Write Protect command (0x73) performs a Read Unprotect instead of disabling write protection. Workaround: Uses No-Stretch Write Unprotect command (0x74) that is performing correctly the write unprotect operation |


*Note:**	Instability** **when** **performing** **multiple** **resets** **during** **operations** **ongoing** **causing** **Overrun** **or** FrameError errors on USART Bootloader and not recoverable unless Hardware Reset is performed. Fixed by workaround in FUS V1.0.1 and V1.0.2.*




### Bootloader configuration

The STM32WBA5xxx bootloader is activated by applying Pattern12 (described in [Table 2](#_bookmark7)). [Table 185](#_bookmark684)* *shows the hardware resources used by this bootloader.
The bootloader follows boot model V3_1 (see [Section 4.10](#_bookmark35)), so it inherits all its constraints.

**Table** **185.** **STM32WBA5xxx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 60 MHz (using PLL clocked by HSI). |
|  | RAM | - | 6 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 28 Kbytes, starting from address 0x0BF88000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA8 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PB12 pin: USART1 in transmission mode. Not set until USART1 is detected. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA11 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PA12 pin: USART2 in transmission mode. Not set until USART2 is detected. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1100110x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB2 pin: clock line is used in open-drain pull up mode. |
|  | I2C1_SDA pin |  | PB1 pin: data line is used in open-drain pull up mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1100110x (x = 0 for write and x = 1 for read) |
|  | I2C3_SCL pin | Input/output | PA6 pin: clock line is used in open-drain pull up mode. |
|  | I2C3_SDA pin |  | PA7 pin: data line is used in open-drain pull up mode. |
| SPI3 | SPI3 | Enabled | The SPI3 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI3_MOSI pin | Input | PB8 pin: slave data input line, used in push-pull, no pull mode |
|  | SPI3_MISO pin | Output | PB9 pin: slave data output line, used in push-pull, no pull mode |
|  | SPI3_SCK pin | Input | PA0 pin: slave clock line, used in push-pull, no pull mode |
|  | SPI3_NSS pin |  | PA5 pin: slave chip select pin used in push-pull, no pull mode. |


**Table** **186.** **STM32WBA5xxx** **special** **commands**
| Special commands supported (USART/I2C/SPI) Opcode - 0x50 |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Function | Sub-Opcode (2 bytes) | Number of data sent (2 bytes) | Data sent | Number of data received | Data received | Number of status data received (2 bytes) | Status data received |
| TrustZone disable Must be run when TZEN = 1 and RDP = 1 | 0x82 | 0x4 | 0x0 | 0x0 | NA | 0x1 | 0x0 |
| Regression from RDP L1 to RDP 0.5 Must be run when TZEN = 1 and RDP = 1 | 0x82 | 0x4 | 0x1 | 0x0 | NA | 0x1 | 0x0 |
| Unlock write protection Must be run when RDP = 1 | 0x82 | 0x4 | 0xYY02(1) | 0x0 | NA | 0x1 | 0x0 |

1. 0xYY can have three values (0: WRP area, 1: WRP1A, 2: WRP2A)




**Figure** **111.Bootloader** **V11.x** **selection** **for** **STM32WBA5xxx**

































**Table** **187.** **STM32WBA5xxx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V11.0 | Initial bootloader version for Rev A samples | None |
| V11.1 | Initial bootloader version for Rev B samples | None |





### Bootloader configuration

The STM32WBA2xxx bootloader is activated by applying Pattern12 (see [Table 2](#_bookmark7)). [Table 188](#_bookmark692)* *shows the hardware resources used by this bootloader.
The bootloader follows boot model V3_1 (see [Section 4.10](#_bookmark35)), so it inherits all its constraints.

**Table** **188.** **STM32WBA2xxx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 48 MHz with PLL. |
|  |  | HSE enabled | By reading the engineering bytes we can check if the USB FS IP is enabled on the package or not. When USB FS is enabled, the HSE is enabled from the startup. Once HSE is ready, it is considered as the main entry for the PLL and system clock is switched to HSE through PLL. The clock of USB is 48 MHz taken from HSE with PLL. |
|  | RAM | - | 12 Kbytes, starting from address 0x20000000 are used by the bootloader firmware. |
|  | System memory | - | 28 Kbytes, starting from address 0x0BF85000, contain the bootloader firmware. |
|  | IWDG | - | The independent watchdog (IWDG) prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (in case the hardware IWDG option was previously enabled by the user). |
| USART1 | USART1 | Enabled | Once initialized, the USART1 configuration is: 8 bits, even parity and 1 Stop bit. |
|  | USART1_RX pin | Input | PA12 pin: Used in all packages except QFN32 and QFN48-SMPS. PA8 pin: Used in packages QFN32 and QFN48-SMPS. USART1 in reception mode. Used in alternate push-pull, pull-up mode |
|  | USART1_TX pin | Output | PA6 pin: Used in all packages except QFN32 and QFN48-SMPS. PB12 pin: Used in packages QFN32 and QFN48-SMPS. USART1 in transmission mode. Kept in reset configuration until 0x7F detected on USART_RX. |



**Table** **188.** **STM32WBA2xxx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1111000x (where x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/Output | PA15 pin: clock line is used in open-drain pull-up mode. |
|  | I2C1_SDA pin | Input/Output | PB3 pin: data line is used in open-drain pull-up mode. |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 400Khz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1111000x (where x = 0 for write and x = 1 for read) |
|  | I2C3_SCL pin | Input/Output | PB2 pin: used in all packages except QFN32 and QFN48-SMPS. PA6 pin: used in packages QFN32 and QFN48-SMPS. Clock line is used in open-drain pull-up mode. |
|  | I2C3_SDA pin | Input/Output | PA11 pin: used in all packages except QFN32 and QFN48-SMPS. PA7 pin: used in packages QFN32 and QFN48-SMPS. Data line is used in open-drain pull-up mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI3 | SPI3_MOSI pin | Input | PA6 pin: used in all packages except QFN32 and QFN48-SMPS. Slave data Input line, used in push-pull, no pull mode. PB8 pin: used in packages QFN32 and QFN48-SMPS. Slave data Input line, used in push-pull, pull-down mode. |
|  | SPI3_MISO pin(1) | Output | PB4 pin: used in all packages except QFN32 and QFN48-SMPS. PB9 pin: used in packages QFN32 and QFN48-SMPS. Slave data output line, used in push-pull, pull-down mode. |
|  | SPI3_SCK pin | Input | PA8 pin: used in all packages except QFN32 and QFN48-SMPS. PA0 pin: used in packages QFN32 and QFN48-SMPS. Slave clock line, used in push-pull, pull-down mode. |
|  | SPI3_NSS pin | Input | PA5 pin: slave chip select pin used in push-pull, pull-down mode. |
| DFU | USB | Enabled | USB FS configured in forced device mode. USB FS interrupt vector is enabled and used for USB DFU communications. |
|  | USB_DM pin | Input/Output | PB9 pin: Not configured by bootloader SW. |
|  | USB_DP pin |  | PB8 pin: Not configured by bootloader SW. |

1. SPI Tx (MISO) is handled by DMA. On the bootloader start-up after SPI initialization as soon as the bit DMATx enable on SPI CR2 register is set to 0x1, the MISO line is set to 3.3 V.


**Table** **189.** **STM32WBA2xxx** **special** **commands**
| Special commands supported (USART/I2C/SPI) Opcode – 0x50 |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Function | Sub-Opcode (2 bytes) | Number of data sent (2 bytes) | Data sent | Number of data received | Data received (2 bytes) | Number of status data received (2 bytes) | Status data received |
| TrustZone disable Must be run when TZEN = 1 and RDP = 1 | 0x82 | 0x4 | 0x0 | 0x0 | NA | 0x1 | 0x0 |
| Regression from RDP L1 to RDP 0.5 Must be run when TZEN = 1 and RDP = 1 | 0x82 | 0x4 | 0x1 | 0x0 | NA | 0x1 | 0x0 |
| Unlock write protection Must be run when RDP = 1 | 0x82 | 0x4 | 0xYY02 (1) | 0x0 | NA | 0x1 | 0x0 |

1. 0xYY can have three values (0: all WRP areas, 1: WRP1A, 2: WRP1B).

*Note:**	USB** **special** **commands** **differ** **from** **other** **protocols** **due** **to** **USB** **protocol** **specificities:*
  - *No** **opcode** **is** **used;** **the** **sub-opcode** **is** **used** **directly.*
  - *The** **sub-opcode** **is** **treated** **as** **a** **single** **byte,** **not** **two** **bytes.*
  - *Data** **is** **sent** **on** **the** **USB** **frame** **byte** **by** **byte;** **there** **is** **no** **need** **to** **specify** **the** **number** of data bytes to be transmitted.*
  - *Returned** **data** **and** **status** **are** **formatted** **according** **to** **the** **native** **USB** **protocol.*




**Figure** **112.** **Bootloader** **V13.x** **selection** **for** **STM32WBA2xxx**


### Bootloader version

**Table** **190.** **STM32WBA2xxx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V13.0 | Initial bootloader version | None |


## STM32WBA62xx/63xx/64xx/65xx devices


### Bootloader configuration

The STM32WBA62xx/63xx/64xx/65xx bootloader is activated by applying Pattern12 (described in [Table 2](#_bookmark7)). [Table 191](#_bookmark700)* *shows the hardware resources used by this bootloader.
The bootloader follows boot model V3_1 (see [Section 4.10](#_bookmark35)), so it inherits all its constraints.

**Table** **191.** **STM32WBA62xx/63xx/64xx/65xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 60 MHz (using HSI through PLL1 source). |
|  |  | HSE enabled | Enabled only when USB cable detected. HSE must be 32 MHz to have the USB working. |
|  | RAM | - | 12 Kbytes, starting from address 0x2000 0000 are used by the bootloader firmwaree |
|  | System memory | - | 64 Kbytes, starting from address 0x0BF9 0000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA8 pin: USART1 in reception mode. Used in alternate function, pull-up mode. |
|  | USART1_TX pin | Output | PB12 pin: USART1 in transmission mode. Kept in reset configuration until 0x7F detected on USART_RX. |
| USART3 | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PA11 pin: USART3 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART3_TX pin | Output | PA12 pin: USART2 in transmission mode. Kept in reset configuration until 0x7F detected on USART_RX. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1101111x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB2 pin: clock line is used in open-drain no pull mode. |
|  | I2C1_SDA pin |  | PB1 pin: data line is used in open-drain no pull mode. |



**Table** **191.** **STM32WBA62xx/63xx/64xx/65xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1101111x (x = 0 for write and x = 1 for read) |
|  | I2C3_SCL pin | Input/output | PA6 pin: clock line is used in open-drain no pull mode. |
|  | I2C3_SDA pin |  | PA7 pin: data line is used in open-drain no pull mode. |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PB14 pin: Slave data Input line, used in alternate function with no pull. |
|  | SPI2_MISO pin(1) | Output | PB0 pin: Slave data output line used in alternate function with no pull. |
|  | SPI2_SCK pin | Input | PA9 pin: Slave clock line, used in alternate function with no pull. |
|  | SPI2_NSS pin |  | PA10 pin: slave chip select pin used in alternate function with no pull. |
| SPI3 | SPI3 | Enabled | The SPI3 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI3_MOSI pin | Input | PB8 pin: Slave data Input line, used in alternate function with pull down. |
|  | SPI3_MISO pin | Output | PB9 pin: Slave data output line used in alternate function with no pull. |
|  | SPI3_SCK pin | Input | PA0 pin: Slave clock line, used in alternate function with no pull. |
|  | SPI3_NSS pin |  | PA5 pin: slave chip select pin used in alternate function with no pull. |
| DFU | USB | Enabled | USB configured in device mode. USB interrupt vector is enabled and used for DFU communications. |
|  | USB_DM pin | Input/output | PD7: USB DM line. Used in alternate function, no pull mode. |
|  | USB_DP pin |  | PD6: USB DP line. Used in alternate function, no pull mode. No external pull-up resistor is required. |




1. SPI Tx (MISO) is handled by DMA. On the bootloader start-up after SPI initialization, as soon as the bit DMATx enable on SPI CR2 register is set to 0x1, the MISO line is set to 3.3 V.


**Table** **192.** **STM32WBA62xx/63xx/64xx/65xx** **special** **commands**
| Special commands supported (USART/I2C/SPI) Opcode - 0x50 |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Function | Sub-Opcode (2 bytes) | Number of data sent (2 bytes) | Data sent | Number of data received | Data received | Number of status data received (2 bytes) | Status data received |
| TrustZone disable Must be run when TZEN = 1 and RDP = 1 | 0x82 | 0x4 | 0x0 | 0x0 | NA | 0x1 | 0x0 |
| Regression from RDP L1 to RDP 0.5 Must be run when TZEN = 1 and RDP = 1 | 0x82 | 0x4 | 0x1 | 0x0 | NA | 0x1 | 0x0 |
| Unlock write protection Must be run when RDP = 1 | 0x82 | 0x4 | 0xYY02(1) | 0x0 | NA | 0x1 | 0x0 |

1. 0xYY can have three values (0: WRP area, 1: WRP1A, 2: WRP2A)

*Note:**	USB** **special** **commands** **are** **slightly** **different** **from** **the** **other** **protocols** **as** **per** **the** **USB** protocol specificities:*
  - *No** **Opcode** **is** **used,** **Sub-Opcode** **is** **used** **directly*
  - *Sub-Opcode** **is** **treated** **in** **a** **single** **byte** **and** **not** **in** **two** **bytes*
  - *Data** **are** **sent** **on** **USB** **frame** **byte** **per** **byte.** **No** **need** **to** **add** **the** **number** **of** **data** **to** **be** **transmitted*
  - *Returned** **data** **and** **status** **are** **formatted** **on** **the** **USB** **native** **protocol*

### Bootloader selection

**Figure** **113.Bootloader** **V13.2** **selection** **for** **STM32WBA62xx/63xx/64xx/65xx**

### Bootloader version


**Table** **193.** **STM32WBA62xx/63xx/64xx/65xx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V13.2 | Initial bootloader version | None |





### Bootloader configuration

The STM32WB05xx bootloader is activated by applying Pattern 18 (described in [Table 2](#_bookmark7)). [Table 194](#_bookmark708)* *shows the hardware resources used by this bootloader.

**Table** **194.** **STM32WB05xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 16 MHz using HSI |
|  | RAM | - | The last 3 Kbytes of the last bank |
|  | System memory | - | 6 Kbytes, starting from address 0x10000000, contain the bootloader firmware |
| USART | USART | Enabled | Once initialized, the configuration is 8-bit, no parity |
|  | USART_RX pin | Input | PB0 pin: USART in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART_TX pin | Output | PA1 pin: USART in transmission mode. Not set until USART is detected. |


### Bootloader selection

[Figure 114](#_bookmark710)* *shows the bootloader selection mechanism.

**Figure** **114.** **Bootloader** **V2.x** **selection** **for** **STM32WB05xx**



### Bootloader version


**Table** **195.** **STM32WB05xx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V2.0 | Final bootloader version | None |





### Bootloader configuration

The STM32WB06xx/07xx bootloader is activated by applying Pattern 18 (described in
[Table 2](#_bookmark7)). [Table 196](#_bookmark715)* *shows the hardware resources used by this bootloader.

**Table** **196.** **STM32WB06xx/07xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 16 MHz using HSI |
|  | RAM | - | The last 3 Kbytes of the last bank |
|  | System memory | - | 6 Kbytes, starting from address 0x10000000, contain the bootloader firmware |
| USART | USART | Enabled | Once initialized, the configuration is 8-bit, no parity |
|  | USART_RX pin | Input | PA8 pin: USART in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART_TX pin | Output | PA9 pin: USART in transmission mode. Not set until USART is detected. |


### Bootloader selection

[Figure 115](#_bookmark717)* *shows the bootloader selection mechanism.

**Figure** **115.** **Bootloader** **V4.x** **selection** **for** **STM32WB06xx/07xx**



### Bootloader version


**Table** **197.** **STM32WB06xx/07xx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V4.0 | Final bootloader version | None |





### Bootloader configuration

The STM32WB09xx bootloader is activated by applying Pattern 18 (described in [Table 2](#_bookmark7)). [Table 198](#_bookmark722)* *shows the hardware resources used by this bootloader.

**Table** **198.** **STM32WB09xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 16 MHz using HSI |
|  | RAM | - | The last 3 Kbytes of the last bank |
|  | System memory | - | 6 Kbytes, starting from address 0x10000000, contain the bootloader firmware |
| USART | USART | Enabled | Once initialized, the configuration is 8-bit, no parity |
|  | USART_RX pin | Input | PB0 pin: USART in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART_TX pin | Output | PA1 pin: USART in transmission mode. Not set until USART is detected. |


### Bootloader selection

[Figure 118](#_bookmark738)* *shows the bootloader selection mechanism.

**Figure** **116.** **Bootloader** **V1.x** **selection** **for** **STM32WB09xx**



### Bootloader version


**Table** **199.** **STM32WB09xx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V1.0 | Final bootloader version | None |





### Bootloader configuration

The STM32WL3xxx bootloader is activated by applying Pattern 18 (described in [Table 2](#_bookmark7)). [Table 200](#_bookmark729)* *shows the hardware resources used by this bootloader.

**Table** **200.** **STM32WL3xxx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 16 MHz using HSI |
|  | RAM | - | The last 3 Kbytes of the last bank |
|  | System memory | - | 6 Kbytes, starting from address 0x10000000, contain the bootloader firmware |
| USART | USART | Enabled | Once initialized, the configuration is 8-bit, no parity |
|  | USART_RX pin | Input | For QFN48 package: UART Rx = PA15 For QFN32 package: UART Rx = PB14 |
|  | USART_TX pin | Output | UART Tx = PA1 |


### Bootloader selection

[Figure 117](#_bookmark731)* *shows the bootloader selection mechanism.

**Figure** **117.** **Bootloader** **V12.x** **selection** **for** **STM32WL3xxx**



### Bootloader version


**Table** **201.** **STM32WL3xxx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V4.0 | Initial bootloader version | None |





### Bootloader configuration

The STM32WLE5xx/55xx bootloader is activated by applying Pattern 13 (described in
[Table 2](#_bookmark7)). [Table 202](#_bookmark736)* *shows the hardware resources used by this bootloader.

**Table** **202.** **STM32WLE5xx/55xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 48 MHz (using PLL clocked by HSI). |
|  | RAM | - | 8 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 16 Kbytes, starting from address 0x1FFF0000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. |



**Table** **202.** **STM32WLE5xx/55xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in push-pull, pull-down mode. Note: This IO can be tied to GND if the SPI master does not use it. |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware |
|  | SPI2_MOSI pin | Input | PB15 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI2_MISO pin | Output | PB14 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI2_SCK pin | Input | PB13 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI2_NSS pin | Input | PB12 pin: slave chip select pin used in push-pull, pull-down mode. Note: This IO can be tied to GND if the SPI master does not use it. |





[Figure 118](#_bookmark738)* *shows the bootloader selection mechanism.

**Figure** **118.** **Bootloader** **V12.x** **selection** **for** **STM32WLE5xx/55xx**

### Bootloader version


**Table** **203.** **STM32WLE5xx/55xx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V12.2 | Initial bootloader version on rev. Z samples | BL cannot write/read the following option bytes: FLASH_SFR (Offset - 0x80) FLASH_SRRVR (Offset - 0x84) |
| V12.3 | Final bootloader version on rev. Z samples | BL cannot write/read the following option bytes: FLASH_SFR (Offset - 0x80) FLASH_SRRVR (Offset - 0x84) |
| V12.4 | Final bootloader version on rev. Y samples | BL cannot write/read the following option bytes: FLASH_SFR (Offset - 0x80) FLASH_SRRVR (Offset - 0x84) |


## STM32U031xx devices


### Bootloader configuration

The STM32U031xx bootloader is activated by applying Pattern 11 (described in [Table 2](#_bookmark7)). [Table 204](#_bookmark743)* *shows the hardware resources used by this bootloader.

**Table** **204.** **STM32U031xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI16 enabled | The system clock frequency is 24 MHz (using PLL clocked by HSI16). |
|  | RAM | - | 5 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 14 Kbytes, starting from address 0x1FFF0000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| Securable memory area | - | - | The address to jump to for the securable memory area is 0x1FFF3500 |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART in reception mode. Used in alternate function input, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART in transmission mode. Kept in reset configuration until 0x7F is detected on USART_RX. PA11 is remapped to PA9 on the TSSOP20 package. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART in reception mode. Used in alternate function input, pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART in transmission mode. Kept in reset configuration until 0x7F is detected on USART_RX. |
| USART3 | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PC11 pin: USART in reception mode. Used in alternate function input, pull-up mode. |
|  | USART3_TX pin | Output | PC10 pin: USART in transmission mode. Kept in reset configuration until 0x7F is detected on USART_RX. |
|  | EXTI line 11 | Input | Used on detection on USART and its IT for baudrate calculation |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1101011x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain pull-up mode. |
|  | I2C1_SDA pin |  | PB7 pin: data line is used in open-drain pull-up mode. |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1101011x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PB10 pin: clock line is used in open-drain pull-up mode. |
|  | I2C2_SDA pin |  | PB11 pin: data line is used in open-drain pull-up mode. |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1101011x (x = 0 for write and x = 1 for read) |
|  | I2C3_SCL pin | Input/output | PB3 pin: clock line is used in open-drain pull-up mode. |
|  | I2C3_SDA pin |  | PB4 pin: data line is used in open-drain pull-up mode. |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in alternate function, pull-down mode |
|  | SPI1_MISO pin(1) | Output | PA6 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in alternate function, pull-down mode. PA1 pin is used instead of PA5 on TSSOP20 package. Used on push-pull, pull-up mode |
|  | SPI1_NSS pin |  | PA4 pin: slave chip select pin used in alternate function, pull-down mode. |



**Table** **204.** **STM32U031xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PB15 pin: slave data input line, used in alternate function, no pull mode |
|  | SPI2_MISO pin(1) | Output | PB14 pin: slave data output line, used in push-pull, no pull mode |
|  | SPI2_SCK pin | Input | PB13 pin: slave clock line, used in alternate function, no pull mode |
|  | SPI2_NSS pin | Input | PB12 pin: slave chip select pin used in alternate function, no pull mode. |

1. SPI Tx (MISO) is handled by DMA. On the bootloader start-up after SPI initialization, as soon as the bit DMATx enable on SPI CR2 register is set to 1, the MISO line is set to 3.3 V.




[Figure 119](#_bookmark746)* *shows the bootloader selection mechanism.

**Figure** **119.** **Bootloader** **V11.x** **selection** **for** **STM32U031xx**


### Bootloader version

**Table** **205.** **STM32U031xx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V11.1 | Initial bootloader version | Empty check flag cleared by error on the bootloader startup phase – Root cause: on the startup phase the bootloader SW performs a system deinitialization, leading to write the default value on the FLASH_ACR register, which overrides the Empty check bit with 0 Behavior: when Empty check boot mode is used and the flash memory is empty, the MCU boots on the bootloader but the flag is cleared by the SW. If a reset is triggered, the system tries to boot on the empty flash memory, and crashes. Caution: Avoid using reset on this case. if the system crashes, an option byte change or POR is needed to reboot. |





### Bootloader configuration

The STM32U073xx/83xx bootloader is activated by applying Pattern 11 (described in
[Table 2](#_bookmark7)). [Table 206](#_bookmark751)* *shows the hardware resources used by this bootloader.

**Table** **206.** **STM32U073xx/83xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 24 MHz (using PLL clocked by HSI). |
|  |  | HSI48 enabled | The clock recovery system (CRS) is enabled for the DFU bootloader to allow USB to be clocked by HSI48 48 MHz |
|  | RAM | - | 8.5 Kbytes, starting from address 0x2000000, are used by the bootloader firmware |
|  | System memory | - | 26 Kbytes, starting from address 1FFF0000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| Securable memory area | - | - | The address to jump to for the securable memory area is 0x1FFF6000 |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART in reception mode. Used in alternate function, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART in transmission mode. Kept in reset configuration until 0x7F is detected on USART_RX. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART in reception mode. Used in alternate function, pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART in transmission mode. Kept in reset configuration until 0x7F is detected on USART_RX. |
| USART3 | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PC11 pin: USART in reception mode. Used in alternate function, pull-up mode. |
|  | USART3_TX pin | Output | PC10 pin: USART in transmission mode. Kept in reset configuration until 0x7F is detected on USART_RX. |
|  | EXTI line 11 | Input | Used on detection on USART and its IT for baudrate calculation |



**Table** **206.** **STM32U073xx/83xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1101010x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain pull-up mode. |
|  | I2C1_SDA pin |  | PB7 pin: data line is used in open-drain pull-up mode. |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1101010x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PB10 pin: clock line is used in open-drain pull-up mode. |
|  | I2C2_SDA pin |  | PB11 pin: data line is used in open-drain pull-up mode. |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1101010x (x = 0 for write and x = 1 for read) |
|  | I2C3_SCL pin | Input/output | PB3 pin: clock line is used in open-drain pull-up mode. |
|  | I2C3_SDA pin |  | PB4 pin: data line is used in open-drain pull-up mode. |
| SPI1 | SPI | Enabled | The SPI configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in alternate function, pull-down mode |
|  | SPI1_MISO pin(1) | Output | PA6 pin: slave data output line, used in push pull, pull-down mode |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in alternate function, pull-down mode |
|  | SPI1_NSS pin |  | PA4 pin: slave chip select pin used in alternate function, pull-down mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI2 | SPI | Enabled | The SPI configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PB15 pin: slave data input line, used in alternate function, pull-down mode |
|  | SPI2_MISO pin(1) | Output | PB14 pin: slave data output line, used in push-pull, pull mode |
|  | SPI2_SCK pin | Input | PB13 pin: slave clock line, used in alternate function, pull-down mode |
|  | SPI2_NSS pin |  | PB12 pin: slave chip select pin used in alternate function, pull-down mode. |
| DFU | USB | Enabled | USB configured in device mode. USB interrupt vector is enabled and used for USB DFU communications. |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in additional function mode, behaving as input until communication starts. |
|  | USB_DP pin |  | PA12: USB DP line. Used in additional function mode, behaving as input until communication starts. |

1. SPI Tx (MISO) is handled by DMA. On the bootloader start-up after SPI initialization, as soon as the bit DMATx enable on SPI CR2 register is set to 1, the MISO line is set to 3.3 V.

### Bootloader selection

[Figure 120](#_bookmark754)* *shows the bootloader selection mechanism.

**Figure** **120.** **Bootloader** **V13.x** **selection** **for** **STM32U073xx/83xx**





**Table** **207.** **STM32U073xx/83xx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V13.0 | Initial bootloader version | Empty check flag cleared by error on the bootloader startup phase – Root cause: on the startup phase the bootloader SW performs a system deinitialization, leading to write the default value on the FLASH_ACR register, which overrides the Empty check bit with 0 Behavior: when Empty check boot mode is used and the flash memory is empty, the MCU boots on the bootloader but the flag is cleared by the SW. If a reset is triggered, the system tries to boot on the empty flash memory, and crashes. Caution: Avoid using reset on this case. if the system crashes, an option byte change or POR is needed to reboot. |





### Bootloader configuration

The STM32U375xx/85xx bootloader is activated by applying Pattern 12 (described in
[Table 2](#_bookmark7)). [Table 208](#_bookmark759)* *shows the hardware resources used by this bootloader.
The bootloader follows boot model V3_1 (see [Section 4.10](#_bookmark35)), so it inherits all its constraints.

**Table** **208.** **STM32U375xx/85xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | MSI enabled | The system clock frequency is 48 MHz (using MSIS source, that is, MSI divided by 2)). |
|  |  | - | 48 MHz derived from the MSIK (MSI divided by 2) is used for FDCAN |
|  |  | HSI48 | CRS is enabled for the DFU so that USB can be clocked by HSI 48 MHz |
|  | RAM | - | 16 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 40 Kbytes, starting from address 0xBF8 F000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate function, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Kept in reset configuration until 0x7F detected on USART_RX. |
| USART3 | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PC11 pin: USART3 in reception mode. Used in alternate function, pull-up mode. |
|  | USART3_TX pin | Output | PC10 pin: USART3 in transmission mode. Kept in reset configuration until 0x7F detected on USART_RX. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1101100x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain pull-up mode. |
|  | I2C1_SDA pin | Input/output | PB7 pin: data line is used in open-drain pull-up mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1011010x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PB10 pin: clock line is used in open-drain pull-up mode. |
|  | I2C2_SDA pin | Input/output | PB11 pin: data line is used in open-drain pull-up mode. |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1011010x (x = 0 for write and x = 1 for read) |
|  | I2C3_SCL pin | Input/output | PC0 pin: clock line is used in open-drain pull-up mode. |
|  | I2C3_SDA pin | Input/output | PC1 pin: data line is used in open-drain pull-up mode. |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: Slave data Input line, used in alternate function with pull down. On release v14.2, PG4 pin is used instead of PA7 on WLCSP68-G package. Used on alternate function with pull down. |
|  | SPI1_MISO pin(1) | Output | PA6 pin: Slave data output line used in alternate function with pull down. On release v14.2, PG3 pin is used instead of PA6 on WLCSP68-G package. Used on alternate function with pull down. |
|  | SPI1_SCK pin | Input | PA5 pin: Slave clock line, used in alternate function with pull down. On release v14.2, PG2 pin is used instead of PA5 on WLCSP68-G package. Used on alternate function with pull down. |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in alternate function with pull down. On release v14.2, PG5 pin is used instead of PA4 on WLCSP68-G package. Used on alternate function with pull down. |



**Table** **208.** **STM32U375xx/85xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PD4 pin: Slave data Input line, used in alternate function with pull down. |
|  | SPI2_MISO pin(1) | Output | PD3 pin: Slave data output line used in alternate function with pull down. |
|  | SPI2_SCK pin | Input | PD1 pin: Slave clock line, used in alternate function with pull down. |
|  | SPI2_NSS pin | Input | PD0 pin: slave chip select pin used in alternate function with pull down. |
| SPI3 | SPI3 | Enabled | The SPI3 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI3_MOSI pin | Input | PB5 pin: Slave data Input line, used in alternate function with pull down. |
|  | SPI3_MISO pin(1) | Output | PB4 pin: Slave data output line used in alternate function with pull down. |
|  | SPI3_SCK pin | Input | PB3 pin: Slave clock line, used in alternate function with pull down. |
|  | SPI3_NSS pin | Input | PA15 pin: slave chip select pin used in alternate function with pull down. |
| FDCAN1 | FDCAN1 | Enabled | Once initialized the configuration is: Connection bit rate 600 kbit/s Data bit rate 2400 kbit/s FrameFormat = FDCAN_FRAME_FD_BRS Mode = FDCAN_MODE_NORMAL AutoRetransmission = ENABLE TransmitPause = DISABLE ProtocolException = ENABLE |
|  | FDCAN1_Rx pin | Input/ | PB8 pin: FDCAN1 in reception mode. Used in alternate function, pull-up mode. |
|  | FDCAN1_Tx pin | Output | PB9 pin: FDCAN1 in transmission mode. Used in alternate function, pull-up mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| DFU | USB | Enabled | USB configured in device mode. USB interrupt vector is enabled and used for DFU communications. |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in alternate function with no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in alternate function with no pull mode. No external pull-up resistor is required. |
| I3C1 | I3C | Enabled | Mode: target mode Aval timing:0x4E DMA Reg RX: disabled DMA Req TX: disabled Status FIFO: disabled DMA Req status: disabled DMA Req control: disabled IBI: enabled Additional data after IBI ack-ed: 1 byte IBI configuration: Mandatory Data Byte (MDB) All IT disabled except RXFNE (Receive FIFO Interrupt) The RXFNE interruption is disabled after SYNC byte detection by the bootloader. |
|  | I3C_SCL pin | Input/Output | PB13 pin: clock line is used in open-drain pull up mode. |
|  | I3C_SDA pin | Input/Output | PA1 pin: clock line is used in open-drain pull up mode. |

1. SPI Tx (MISO) is handled by DMA. On the bootloader start-up after SPI initialization as soon as the bit DMATx enable on SPI CR2 register is set to 0x1, the MISO line is set to 3.3 V.

### SPI1 pinout on WLCSP68-G

The SPI1 pinout on the WLCSP68-G package is different from all the other packages: it uses pins PG5/PG2/PG3/PG4 instead of pins PA4/PA5/PA6/PA7. This makes it possible to use an independent voltage for the SPI1 pins through VDDIO2, to provide them a voltage different from the global MCU voltage (3.3 V).
When using 1.2 V for these pins, the HSLV feature must be enabled on PortG. To protect this feature, which can damage the pins in case of bad usage, some SW option bytes are reserved. Bits 22 and 23 from Flash OPTR registers must be written to 0b11 while enabling IOHSLV feature (refer to RM0487 for OPTR register description).


### Boot model

The bootloader follows boot model V3_1 (see [Section 4.10](#_bookmark35)), so it inherits all its constraints.


**Table** **209.** **STM32U375xx/385xx** **special** **commands**
| Special commands supported (USART/I2C/SPI/FDCAN) Opcode - 0x50 |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Function | Sub-Opcode (2 bytes) | Number of data sent (2 bytes) | Data sent | Number of data received | Data received | Number of status data received (2 bytes) | Status data received |
| TrustZone disable Must be run when TZEN = 1 and RDP = 1 | 0x82 | 0x4 | 0x0 | 0x0 | NA | 0x1 | 0x0 |
| Regression from RDP L1 to RDP 0.5 Must be run when TZEN = 1 and RDP = 1 | 0x82 | 0x4 | 0x1 | 0x0 | NA | 0x1 | 0x0 |
| Unlock write protection Must be run when RDP = 1 | 0x82 | 0x4 | 0xYY02(1) | 0x0 | NA | 0x1 | 0x0 |

1. 0xYY can have five values (0: WRP area, 1: WRP1A, 2: WRP2A, 3: WRP1B, 4: WRP2B)

*Note:**	USB** **special** **commands** **are** **slightly** **different** **from** **the** **other** **protocols** **as** **per** **the** **USB** protocol specificities:*
  - *No** **Opcode** **is** **used,** **Sub-Opcode** **is** **used** **directly*
  - *Sub-Opcode** **is** **treated** **in** **a** **single** **byte** **and** **not** **two** **bytes*
  - *Data** **are** **sent** **on** **USB** **frame** **byte** **per** **byte.** **No** **need** **to** **add** **number** **of** **data** **to** **be** **transmitted*
  - *Returned** **data** **and** **status** **are** **formatted** **on** **the** **USB** **native** **protocol*




**Figure** **121.** **Bootloader** **V14.2** **selection** **for** **STM32U375xx/85xx**

### 92.5	Bootloader version

**Table** **210.** **STM32U375xx/85xx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V14.1 | Initial bootloader version | Erasing multiple flash memory pages at the same time is not working, only the first page is erased FDCAN: cannot erase more than 32 flash memory sectors on the same time |
| V14.2 | Correct known limitations Switch SPI1 support on PortG when using WLCSP68-G package instead of PortA Add SW OB support to Enable HSLV for PortG SPI1 pins | – FDCAN: cannot erase more than 32 flash memory sectors on the same time |





### Bootloader configuration

The STM32U3B5xx/3C5xx bootloader is activated by applying Pattern12 (see [Table 2](#_bookmark7)). [Table 211](#_bookmark770)* *shows the hardware resources used by this bootloader.
The bootloader follows boot model V3_1 (see [Section 4.10](#_bookmark35)), so it inherits all its constraints.

**Table** **211.** **STM32U3B5xx/3C5xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | MSI enabled | The system clock frequency is 48 MHz (using MSIS source, that is, MSI divided by 2). |
|  |  |  | 48 MHz derived from the MSIK (MSI divided by 2) is used for FDCAN. |
|  |  | HSI48 enabled | CRS is enabled for the DFU so that USB can be clocked by HSI 48 MHz. |
|  | RAM | - | 16 Kbytes, starting from address 0x20000000 are used by the bootloader firmware. |
|  | System Memory | - | 40 Kbytes starting from address 0x0BF8F000, contain the bootloader firmware. |
|  | IWDG | - | The independent watchdog (IWDG) prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (in case the hardware IWDG option was previously enabled by the user). |
| USART1 | USART1 | Enabled | Once initialized, the USART1 configuration is: 8 bits, even parity and 1 Stop bit. |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Kept in reset configuration until 0x7F detected on USART_RX. |
| USART3 | USART3 | Enabled | Once initialized, the USART3 configuration is: 8 bits, even parity and 1 Stop bit. |
|  | USART3_RX pin | Input | PC11 pin: USART3 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART3_TX pin | Output | PC10 pin: USART3 in transmission mode. Kept in reset configuration until 0x7F detected on USART_RX. |



**Table** **211.** **STM32U3B5xx/3C5xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1110011x (where x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/Output | PB6 pin: clock line is used in open-drain pull-up mode. |
|  | I2C1_SDA pin | Input/Output | PB7 pin: data line is used in open-drain pull-up mode. |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1110011x (where x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/Output | PB10 pin: clock line is used in open-drain pull-up mode. |
|  | I2C2_SDA pin | Input/Output | PB11 pin: data line is used in open-drain pull-up mode. |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 400 kHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1110011x (where x = 0 for write and x = 1 for read) |
|  | I2C3_SCL pin | Input/Output | PC0 pin: clock line is used in open-drain pull up mode. |
|  | I2C3_SDA pin | Input/Output | PC1 pin: data line is used in open-drain pull up mode. |



**Table** **211.** **STM32U3B5xx/3C5xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: Slave data input line, used in push-pull, pull-down mode |
|  | SPI1_MISO pin(1) | Output | PA6 pin: Slave data output line, used in push-pull, pull-down mode |
|  | SPI1_SCK pin | Input | PA5 pin: Slave clock line, used in push-pull, pull-down mode. |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in push-pull, pull-down mode. |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PD4 pin: Slave data Input line, used in push-pull, pull-down mode. |
|  | SPI2_MISO pin(1) | Output | PD3 pin: Slave data output line, used in push-pull, pull-down mode |
|  | SPI2_SCK pin | Input | PD1 pin: Slave clock line, used in push-pull, pull-down mode. |
|  | SPI2_NSS pin | Input | PD0 pin: slave chip select pin used in push-pull, pull-down mode. |
| SPI3 | SPI3 | Enabled | The SPI3 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI3_MOSI pin | Input | PB5 pin: Slave data Input line, used in push-pull, pull-down mode. |
|  | SPI3_MISO pin(1) | Output | PB4 pin: Slave data output line, used in push-pull, pull-down mode |
|  | SPI3_SCK pin | Input | PB3 pin: Slave clock line, used in push-pull, pull-down mode. |
|  | SPI3_NSS pin | Input | PA15 pin: slave chip select pin used in push-pull, pull-down mode. |



**Table** **211.** **STM32U3B5xx/3C5xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| FDCAN | FDCAN1 | Enabled | Once initialized, the FDCAN1 configuration is: Connection bit rate 600 kbit/s Data bit rate 2400 kbit/s FrameFormat = FDCAN_FRAME_FD_BRS Mode = FDCAN_MODE_NORMAL AutoRetransmission = ENABLE TransmitPause = DISABLE ProtocolException = ENABLE |
|  | FDCAN1_Rx pin | Input | PB8 pin: FDCAN1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | FDCAN1_Tx pin | Output | PB9 pin: FDCAN1 in transmission mode. Used in alternate push-pull, pull-up mode. |
| I3C | I3C1 | Enabled | Mode: target mode Aval timing:0x4E DMA Reg RX: disabled DMA Req TX: disabled Status FIFO: disabled DMA Req status: disabled DMA Req control: disabled IBI: enabled – Additional data after IBI ack-ed: 1 byte IBI configuration: Mandatory Data Byte (MDB) All IT disabled except RXFNE (Receive FIFO Interrupt). The RXFNE interruption is disabled after SYNC byte detection by the bootloader. |
|  | I3C1_SCL pin | Input/Output | PB13 pin: I3C1 in transmission mode. Configured in alternate push-pull, pull-up then switched to no pull mode. |
|  | I3C1_SDA pin |  | PA1 pin: I3C1 in transmission mode. Configured in alternate push-pull, pull-up then switched to no pull mode. |
| DFU | USB | Enabled | USB FS configured in forced device mode. USB FS interrupt vector is enabled and used for USB DFU communications. |
|  | USB_DM pin | Input/Output | PA11 pin: USB DM line. Used in alternate push-pull, no pull mode. |
|  | USB_DP pin |  | PA12 pin: USB DP line. Used in alternate push-pull, no pull mode. No external pull-up resistor is required. |

1. SPI Tx (MISO) is handled by DMA. On the bootloader start-up after SPI initialization as soon as the bit DMATx enable on SPI CR2 register is set to 0x1, the MISO line is set to 3.3 V.


**Table** **212.** **STM32U3B5xx/3C5xx** **special** **commands**
| Special commands supported (USART/I2C/I3C/SPI/FDCAN) Opcode – 0x50 |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Function | Sub-Opcode (2 bytes) | Number of data sent (2 bytes) | Data sent | Number of data received | Data received (2 bytes) | Number of status data received (2 bytes) | Status data received |
| TrustZone disable Must be run when TZEN = 1 and RDP = 1 | 0x82 | 0x4 | 0x0 | 0x0 | NA | 0x1 | 0x0 |
| Regression from RDP L1 to RDP 0.5 Must be run when TZEN = 1 and RDP = 1 | 0x82 | 0x4 | 0x1 | 0x0 | NA | 0x1 | 0x0 |
| Unlock write protection Must be run when RDP = 1 | 0x82 | 0x4 | 0xYY02 (1) | 0x0 | NA | 0x1 | 0x0 |

1. 0xYY can have five values (0: all WRP areas, 1: WRP1A, 2: WRP1B, 3: WRP2A, 4: WRP2B).

*Note:**	USB** **special** **commands** **differ** **from** **other** **protocols** **due** **to** **USB** **protocol** **specificities:*
  - *No** **opcode** **is** **used;** **the** **sub-opcode** **is** **used** **directly.*
  - *The** **sub-opcode** **is** **treated** **as** **a** **single** **byte,** **not** **two** **bytes.*
  - *Data** **is** **sent** **on** **the** **USB** **frame** **byte** **by** **byte;** **there** **is** **no** **need** **to** **specify** **the** **number** of data bytes to be transmitted.*
  - *Returned** **data** **and** **status** **are** **formatted** **according** **to** **the** **native** **USB** **protocol.*

### Bootloader selection

**Figure** **122.** **Bootloader** **V14.0** **selection** **for** **STM32U3B5xx/3C5xx**

### Bootloader version

**Table** **213.** **STM32U3B5xx/3C5xx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V14.0 | Initial bootloader version | None |





### Bootloader configuration

The STM32U535xx/545xx bootloader is activated by applying Pattern 12 (described in
[Table 2](#_bookmark7)). [Table 214](#_bookmark779)* *shows the hardware resources used by this bootloader.
The bootloader follows boot model V3_1 (see [Section 4.10](#_bookmark35)), so it inherits all its constraints.

**Table** **214.** **STM32U535xx/545xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 60 MHz (using PLL clocked by HSI). |
|  |  | HSI48 enabled | CRS is enabled for the DFU so that USB can be clocked by HSI 48 MHz. |
|  |  | - | 20 MHz derived from the PLLQ is used for FDCAN |
|  | RAM | - | 16 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 64 Kbytes, starting from address 0x0BF90000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Set as input until USART1 is detected. |
| USART3 | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PC11 pin: USART3 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART3_TX pin | Output | PC10 pin: USART3 in transmission mode. Set as input until USART1 is detected. |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1011010x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain pull-up mode. |
|  | I2C1_SDA pin | Input/output | PB7 pin: data line is used in open-drain pull-up mode. |



**Table** **214.** **STM32U535xx/545xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1011010x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PB10 pin: clock line is used in open-drain pull-up mode. |
|  | I2C2_SDA pin | Input/output | PB11 pin: data line is used in open-drain pull-up mode. |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1011010x (x = 0 for write and x = 1 for read) |
|  | I2C3_SCL pin | Input/output | PC0 pin: clock line is used in open-drain pull-up mode. |
|  | I2C3_SDA pin | Input/output | PC1 pin: data line is used in open-drain pull-up mode. |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, no pull mode |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, no pull mode |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in push-pull, no pull mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PB15 pin: slave data input line, used in push-pull, no pull mode |
|  | SPI2_MISO pin | Output | PB14 pin: slave data output line, used in push-pull, no pull mode |
|  | SPI2_SCK pin | Input | PB13 pin: slave clock line, used in push-pull, no pull mode |
|  | SPI2_NSS pin | Input | PB12 pin: slave chip select pin used in push-pull, no pull mode |
| SPI3 | SPI3 | Enabled | The SPI3 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI3_MOSI pin | Input | PB5 pin: slave data input line, used in push-pull, no pull mode |
|  | SPI3_MISO pin | Output | PG10 pin: slave data input line, used in push-pull, no pull mode |
|  | SPI3_SCK pin | Input | PG9 pin: slave data output line, used in push-pull, no pull mode |
|  | SPI3_NSS pin | Input | PG12 pin: slave chip select pin used in push-pull, no pull mode. |
| FDCAN | FDCAN1 | Enabled | Once initialized the configuration is: Connection bit rate 250 kbit/s Data bit rate 1000 kbit/s FrameFormat = FDCAN_FRAME_FD_BRS Mode = FDCAN_MODE_NORMAL AutoRetransmission = ENABLE TransmitPause = DISABLE ProtocolException = ENABLE |
|  | FDCAN1_Rx pin | Input/ | PB8 pin: FDCAN1 in reception mode. Used in alternate push-pull, no pull mode. |
|  | FDCAN1_Tx pin | Output | PB9 pin: FDCAN1 in transmission mode. Used in alternate push-pull, no pull mode. |



**Table** **214.** **STM32U535xx/545xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| DFU | USB | Enabled | USB FS configured in forced device mode. USB FS interrupt vector is enabled and used for USB DFU communications. |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in input no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in input no pull mode. No external pull-up resistor is required |


**Table** **215.** **STM32U535xx/545xx** **special** **commands**
| Special commands supported (USART/I2C/SPI/FDCAN) Opcode - 0x50 |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Function | Sub-Opcode (2 bytes) | Number of data sent (2 bytes) | Data sent | Number of data received | Data received | Number of status data received (2 bytes) | Status data received |
| TrustZone disable Must be run when TZEN = 1 and RDP = 1 | 0x82 | 0x4 | 0x0 | 0x0 | NA | 0x1 | 0x0 |
| Regression from RDP L1 to RDP 0.5 Must be run when TZEN = 1 and RDP = 1 | 0x82 | 0x4 | 0x1 | 0x0 | NA | 0x1 | 0x0 |
| Unlock write protection Must be run when RDP = 1 | 0x82 | 0x4 | 0xYY02(1) | 0x0 | NA | 0x1 | 0x0 |

1. 0xYY can have five values (0: WRP area, 1: WRP1A, 2: WRP2A, 3: WRP1B, 4: WRP2B)

*Note:**	USB** **special** **commands** **are** **slightly** **different** **from** **the** **other** **protocols** **as** **per** **the** **USB** protocol specificities:*
  - *No** **Opcode** **is** **used,** **Sub-Opcode** **is** **used** **directly*
  - *Sub-Opcode** **is** **treated** **in** **a** **single** **byte** **and** **not** **two** **bytes*
  - *Data** **are** **sent** **on** **USB** **frame** **byte** **per** **byte.** **No** **need** **to** **add** **number** **of** **data** **to** **be** **transmitted*
  - *Returned** **data** **and** **status** **are** **formatted** **on** **the** **USB** **native** **protocol*




[Figure 123](#_bookmark782)* *shows the bootloader selection mechanism.

**Figure** **123.** **Bootloader** **V9.x** **selection** **for** **STM32U535xx/545xx**




	















### Bootloader version

**Table** **216.** **STM32U535xx/545xx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V9.1 | Initial bootloader version | FDCAN Readout unprotect command does not send the command ID to the host |





### Bootloader configuration

The STM32U575xx/85xx bootloader is activated by applying Pattern 12 (described in
[Table 2](#_bookmark7)). [Table 217](#_bookmark787)* *shows the hardware resources used by this bootloader.
The bootloader follows boot model V3_1 (see [Section 4.10](#_bookmark35)), so it inherits all its constraints.

**Table** **217.** **STM32U575xx/85xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 60 MHz (using PLL clocked by HSI). |
|  |  | HSI48 enabled | CRS is enabled for the DFU so that USB can be clocked by HSI 48 MHz. |
|  |  | - | 20 MHz derived from the PLLQ is used for FDCAN |
|  | RAM | - | 16 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 64 Kbytes, starting from address 0x0BF90000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Used in alternate push-pull, pull-up mode. |
| USART3 | USART3 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PC11 pin: USART3 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART3_TX pin | Output | PC10 pin: USART3 in transmission mode. Used in alternate push-pull, pull-up mode. |



**Table** **217.** **STM32U575xx/85xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1011010x (x = 0 for write and x = 1 for read) |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain pull-up mode. |
|  | I2C1_SDA pin | Input/output | PB7 pin: data line is used in open-drain pull-up mode. |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1011010x (x = 0 for write and x = 1 for read) |
|  | I2C2_SCL pin | Input/output | PB10 pin: clock line is used in open-drain pull-up mode. |
|  | I2C2_SDA pin | Input/output | PB11 pin: data line is used in open-drain pull-up mode. |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1011010x (x = 0 for write and x = 1 for read) |
|  | I2C3_SCL pin | Input/output | PC0 pin: clock line is used in open-drain pull-up mode. |
|  | I2C3_SDA pin | Input/output | PC1 pin: data line is used in open-drain pull-up mode. |
| SPI1 | SPI1 | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in push-pull, pull-down mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI2 | SPI2 | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PB15 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI2_MISO pin | Output | PB14 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI2_SCK pin | Input | PB13 pin: slave clock line, used in push-pull, pull-down mode |
|  | SPI2_NSS pin | Input | PB12 pin: slave chip select pin used in push-pull, pull-down mode. |
| SPI3 | SPI3 | Enabled | The SPI3 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI3_MOSI pin | Input | PB5 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI3_MISO pin | Output | PG10 pin: slave data input line, used in push-pull, pull-down mode |
|  | SPI3_SCK pin | Input | PG9 pin: slave data output line, used in push-pull, pull-down mode |
|  | SPI3_NSS pin | Input | PG12 pin: slave chip select pin used in push-pull, pull-down mode. |
| FDCAN | FDCAN1 | Enabled | Once initialized the configuration is: Connection bit rate 250 kbit/s Data bit rate 1000 kbit/s FrameFormat = FDCAN_FRAME_FD_BRS Mode = FDCAN_MODE_NORMAL AutoRetransmission = ENABLE TransmitPause = DISABLE ProtocolException = ENABLE |
|  | FDCAN1_Rx pin | Input/ | PB8 pin: FDCAN1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | FDCAN1_Tx pin | Output | PB9 pin: FDCAN1 in transmission mode. Used in alternate push-pull, pull-up mode. |



**Table** **217.** **STM32U575xx/85xx** **configuration** **in** **system** **memory** **boot** **mode** **(continued)**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| DFU | USB | Enabled | USB FS configured in forced device mode. USB FS interrupt vector is enabled and used for USB DFU communications. Note: VDDUSB IO must be connected to 3.3 V as USB peripheral is used by the bootloader. |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in input no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in input no pull mode. No external pull-up resistor is required |


**Table** **218.** **STM32U575xx/585xx** **special** **commands**
| Special commands supported (USART/I2C/SPI/FDCAN) Opcode - 0x50 |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Function | Sub-Opcode (2 bytes) | Number of data sent (2 bytes) | Data sent | Number of data received | Data received | Number of status data received (2 bytes) | Status data received |
| TrustZone disable Must be run when TZEN = 1 and RDP = 1 | 0x82 | 0x4 | 0x0 | 0x0 | NA | 0x1 | 0x0 |
| Regression from RDP L1 to RDP 0.5 Must be run when TZEN = 1 and RDP = 1 | 0x82 | 0x4 | 0x1 | 0x0 | NA | 0x1 | 0x0 |
| Unlock write protection Must be run when RDP = 1 | 0x82 | 0x4 | 0xYY02(1) | 0x0 | NA | 0x1 | 0x0 |

1. 0xYY can have five values (0: WRP area, 1: WRP1A, 2: WRP2A, 3: WRP1B, 4: WRP2B)

*Note:**	USB** **special** **commands** **are** **slightly** **different** **from** **the** **other** **protocols** **as** **per** **the** **USB** protocol specificities:*
  - *No** **Opcode** **is** **used,** **Sub-Opcode** **is** **used** **directly*
  - *Sub-Opcode** **is** **treated** **in** **a** **single** **byte,** **not** **on** **two** **bytes*
  - *Data** **are** **sent** **on** **USB** **frame** **byte** **per** **byte.** **No** **need** **to** **add** **number** **of** **data** **to** **be** **transmitted*
  - *Returned** **data** **and** **status** **are** **formatted** **on** **the** **USB** **native** **protocol*




**Figure** **124.** **Bootloader** **V9.x** **selection** **for** **STM32U575xx/85xx**




	















### Bootloader version

**Table** **219.** **STM32U575xx/85xx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V9.2 | Initial bootloader version | FDCAN Readout unprotect command does not send the command ID to the host Not possible to change RDP level and secure option bytes at the same time |
| V9.3 | Fix known limitations Add support for writing OEM1 and OEM2 keys separately from other option bytes Add support for reading FLASH NSSR register, to allow user check if OEM keys have been changed or not using the bootloader | – FDCAN Readout unprotect command does not send the command ID to the host |





### Bootloader configuration

The STM32U595xx/99xx/A5xx/A9xx bootloader is activated by applying Pattern 12 (described in [Table 2](#_bookmark7)). [Table 220](#_bookmark795)* *shows the hardware resources used by this bootloader.
The bootloader follows boot model V3_1 (see [Section 4.10](#_bookmark35)), so it inherits all its constraints.

**Table** **220.** **STM32U595xx/99xx/A5xx/A9xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 60 MHz (using PLL clocked by HSI). |
|  |  | - | 20 MHz derived from the PLLQ is used for FDCAN |
|  |  | HSE enabled | When USB cable is detected, SW tries to detect if a quartz is plugged in the board to configure the USBPHY clock. Supported quartz: 8, 12, 16, 20, 24, 26, and 32 MHz If no quartz is detected a system reset is triggered. |
|  | RAM | - | 16 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 64 Kbytes, starting from address 0x0BF90000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Set as input until USART1 is detected. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Set as input until USART1 is detected. |
| USART3 | USART3 | Enabled | Once initialized the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PC11 pin: USART3 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART3_TX pin | Output | PC10 pin: USART3 in transmission mode. Set as input until USART1 is detected. |



**Table** **220.** **STM32U595xx/99xx/A5xx/A9xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1100000x (x = 0 for write and x = 1 for read). |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain pull-up mode. |
|  | I2C1_SDA pin | Input/output | PB7 pin: data line is used in open-drain pull-up mode. |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1100000x (x = 0 for write and x = 1 for read). |
|  | I2C2_SCL pin | Input/output | PB10 pin: clock line is used in open-drain pull-up mode. |
|  | I2C2_SDA pin | Input/output | PB11 pin: data line is used in open-drain pull-up mode. |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1100000x (x = 0 for write and x = 1 for read). |
|  | I2C3_SCL pin | Input/output | PC0 pin: clock line is used in open-drain pull-up mode. |
|  | I2C3_SDA pin | Input/output | PC1 pin: data line is used in open-drain pull-up mode. |
| SPI1 | SPI | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, no pull mode |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, no pull mode |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, no pull mode |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in push-pull, no pull mode. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI2 | SPI | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PB15 pin: slave data input line, used in push-pull, no pull mode |
|  | SPI2_MISO pin | Output | PB14 pin: slave data output line, used in push-pull, no pull mode |
|  | SPI2_SCK pin | Input | PB13 pin: slave clock line, used in push-pull, no pull mode |
|  | SPI2_NSS pin | Input | PB12 pin: slave chip select pin used in push-pull, no pull mode. |
| SPI3 | SPI | Enabled | The SPI3 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI3_MOSI pin | Input | PB5 pin: slave data input line, used in push-pull, no pull mode |
|  | SPI3_MISO pin | Output | PG10 pin: slave data input line, used in push-pull, no pull mode |
|  | SPI3_SCK pin | Input | PG9 pin: slave data output line, used in push-pull, no pull mode |
|  | SPI3_NSS pin | Input | PG12 pin: slave chip select pin used in push-pull, no pull mode. |
| DFU | USB | Enabled | USB HS configured in forced device mode. USB HS interrupt vector is enabled and used for USB DFU communications. |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in input no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in input no pull mode. No external pull-up resistor is required |



**Table** **220.** **STM32U595xx/99xx/A5xx/A9xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| FDCAN | FDCAN1 | Enabled | Once initialized the configuration is: Connection bit rate 250 kbit/s Data bit rate 1000 kbit/s FrameFormat = FDCAN_FRAME_FD_BRS Mode = FDCAN_MODE_NORMAL AutoRetransmission = ENABLE TransmitPause = DISABLE ProtocolException = ENABLE |
|  | FDCAN1_Rx pin | Input/ | PB8 pin: FDCAN1 in reception mode. Used in alternate push-pull, no pull mode. |
|  | FDCAN1_Tx pin | Output | PB9 pin: FDCAN1 in transmission mode. Used in alternate push-pull, no pull mode. |


**Table** **221.** **STM32U595xx/99xx/A5xx/A9xx** **special** **commands**
| Special commands supported (USART/I2C/SPI/FDCAN) Opcode - 0x50 |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Function | Sub-Opcode (2 bytes) | Number of data sent (2 bytes) | Data sent | Number of data received | Data received | Number of status data received (2 bytes) | Status data received |
| TrustZone disable Must be run when TZEN = 1 and RDP = 1 | 0x82 | 0x4 | 0x0 | 0x0 | NA | 0x1 | 0x0 |
| Regression from RDP L1 to RDP 0.5 Must be run when TZEN = 1 and RDP = 1 | 0x82 | 0x4 | 0x1 | 0x0 | NA | 0x1 | 0x0 |
| Unlock write protection Must be run when RDP = 1 | 0x82 | 0x4 | 0xYY02(1) | 0x0 | NA | 0x1 | 0x0 |

1. 0xYY can have five values (0: WRP area, 1: WRP1A, 2: WRP2A, 3: WRP1B, 4: WRP2B)

*Note:**	USB** **special** **commands** **are** **slightly** **different** **from** **the** **other** **protocols** **as** **per** **the** **USB** protocol specificities:*
  - *No** **Opcode** **is** **used,** **Sub-Opcode** **is** **used** **directly*
  - *Sub-Opcode** **is** **treated** **in** **a** **single** **byte** **and** **not** **two** **bytes*
  - *Data** **are** **sent** **on** **USB** **frame** **byte** **per** **byte.** **No** **need** **to** **add** **number** **of** **data** **to** **be** **transmitted*
  - *Returned** **data** **and** **status** **are** **formatted** **on** **the** **USB** **native** **protocol*




[Figure 125](#_bookmark798)* *shows the bootloader selection mechanism.

**Figure** **125.** **Bootloader** **V9.x** **selection** **for** **STM32U595xx/99xx/A5xx/A9xx**



### Bootloader version


**Table** **222.** **STM32U595xx/99xx/A5xx/A9xx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V9.2 | Initial bootloader version | FDCAN Readout unprotect command does not send the command ID to the host |


## STM32U5F7xx/F9xx/G7xx/G9xx devices


### Bootloader configuration

The STM32U5F7xx/F9xx/G7xx/G9xx bootloader is activated by applying Pattern 12 (described in [Table 2](#_bookmark7)). [Table 223](#_bookmark803)* *shows the hardware resources used by this bootloader.

**Table** **223.** **STM32U5F7xx/F9xx/G7xx/G9xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| Common to all | RCC | HSI enabled | The system clock frequency is 60 MHz (using PLL clocked by HSI). |
|  |  | - | 20 MHz derived from the PLLQ is used for FDCAN |
|  |  | HSE enabled | When USB cable is detected, SW tries to detect if a quartz is plugged in the board to configure the USBPHY clock. Supported quartz: 8, 12, 16, 20, 24, 26, and 32 MHz If no quartz is detected, a system reset is triggered. |
|  | RAM | - | 16 Kbytes, starting from address 0x20000000, are used by the bootloader firmware |
|  | System memory | - | 64 Kbytes, starting from address 0x0BF90000, contain the bootloader firmware |
|  | IWDG | - | The IWDG prescaler is configured to its maximum value. It is periodically refreshed to prevent watchdog reset (if the hardware IWDG option was previously enabled by the user). |
| USART1 | USART1 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART1_RX pin | Input | PA10 pin: USART1 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART1_TX pin | Output | PA9 pin: USART1 in transmission mode. Set as input until USART1 is detected. |
| USART2 | USART2 | Enabled | Once initialized, the configuration is 8-bit, even parity, and one stop bit |
|  | USART2_RX pin | Input | PA3 pin: USART2 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART2_TX pin | Output | PA2 pin: USART2 in transmission mode. Set as input until USART1 is detected. |
| USART3 | USART3 | Enabled | Once initialized the configuration is 8-bit, even parity, and one stop bit |
|  | USART3_RX pin | Input | PC11 pin: USART3 in reception mode. Used in alternate push-pull, pull-up mode. |
|  | USART3_TX pin | Output | PC10 pin: USART3 in transmission mode. Set as input until USART1 is detected. |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| I2C1 | I2C1 | Enabled | The I2C1 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1101001x (x = 0 for write and x = 1 for read). |
|  | I2C1_SCL pin | Input/output | PB6 pin: clock line is used in open-drain pull-up mode. |
|  | I2C1_SDA pin |  | PB7 pin: data line is used in open-drain pull-up mode. |
| I2C2 | I2C2 | Enabled | The I2C2 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1101001x (x = 0 for write and x = 1 for read). |
|  | I2C2_SCL pin | Input/output | PB10 pin: clock line is used in open-drain pull-up mode. |
|  | I2C2_SDA pin |  | PB11 pin: data line is used in open-drain pull-up mode. |
| I2C3 | I2C3 | Enabled | The I2C3 configuration is: I2C speed: up to 1 MHz 7-bit address Target mode Analog filter ON Target 7-bit address: 0b1101001x (x = 0 for write and x = 1 for read). |
|  | I2C3_SCL pin | Input/output | PC0 pin: clock line is used in open-drain pull-up mode. |
|  | I2C3_SDA pin |  | PC1 pin: data line is used in open-drain pull-up mode. |
| SPI1 | SPI | Enabled | The SPI1 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI1_MOSI pin | Input | PA7 pin: slave data input line, used in push-pull, no pull mode |
|  | SPI1_MISO pin | Output | PA6 pin: slave data output line, used in push-pull, no pull mode |
|  | SPI1_SCK pin | Input | PA5 pin: slave clock line, used in push-pull, no pull mode |
|  | SPI1_NSS pin | Input | PA4 pin: slave chip select pin used in push-pull, no pull mode. |



**Table** **223.** **STM32U5F7xx/F9xx/G7xx/G9xx** **configuration** **in** **system** **memory** **boot** **mode**
| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| SPI2 | SPI | Enabled | The SPI2 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI2_MOSI pin | Input | PB15 pin: slave data input line, used in push-pull, no pull mode |
|  | SPI2_MISO pin | Output | PB14 pin: slave data output line, used in push-pull, no pull mode |
|  | SPI2_SCK pin | Input | PB13 pin: slave clock line, used in push-pull, no pull mode |
|  | SPI2_NSS pin | Input | PB12 pin: slave chip select pin used in push-pull, no pull mode. |
| SPI3 | SPI | Enabled | The SPI3 configuration is: Slave mode Full Duplex 8-bit MSB Speed up to 8 MHz Polarity: CPOL low, CPHA low, NSS hardware. |
|  | SPI3_MOSI pin | Input | PB5 pin: slave data input line, used in push-pull, no pull mode |
|  | SPI3_MISO pin | Output | PG10 pin: slave data input line, used in push-pull, no pull mode |
|  | SPI3_SCK pin | Input | PG9 pin: slave data output line, used in push-pull, no pull mode |
|  | SPI3_NSS pin | Input | PG12 pin: slave chip select pin used in push-pull, no pull mode. |
| DFU | USB | Enabled | USB HS configured in forced device mode. USB HS interrupt vector is enabled and used for USB DFU communications. |
|  | USB_DM pin | Input/output | PA11: USB DM line. Used in input no pull mode. |
|  | USB_DP pin |  | PA12: USB DP line. Used in input no pull mode. No external pull-up resistor is required |




| Bootloader | Feature/Peripheral | State | Comment |
| --- | --- | --- | --- |
| FDCAN | FDCAN1 | Enabled | Once initialized the configuration is: Connection bit rate 250 kbit/s Data bit rate 1000 kbit/s FrameFormat = FDCAN_FRAME_FD_BRS Mode = FDCAN_MODE_NORMAL AutoRetransmission = ENABLE TransmitPause = DISABLE ProtocolException = ENABLE |
|  | FDCAN1_Rx pin | Input/ | PB8 pin: FDCAN1 in reception mode. Used in alternate push-pull, no pull mode. |
|  | FDCAN1_Tx pin | Output | PB9 pin: FDCAN1 in transmission mode. Used in alternate push-pull, no pull mode. |


**Table** **224.** **STM32U5F7xx/F9xx/G7xx/G9xx** **special** **commands**
| Special commands supported (USART/I2C/SPI/FDCAN) Opcode - 0x50 |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Function | Sub-Opcode (2 bytes) | Number of data sent (2 bytes) | Data sent | Number of data received | Data received | Number of status data received (2 bytes) | Status data received |
| TrustZone disable Must be run when TZEN = 1 and RDP = 1 | 0x82 | 0x4 | 0x0 | 0x0 | NA | 0x1 | 0x0 |
| Regression from RDP L1 to RDP 0.5 Must be run when TZEN = 1 and RDP = 1 | 0x82 | 0x4 | 0x1 | 0x0 | NA | 0x1 | 0x0 |
| Unlock write protection Must be run when RDP = 1 | 0x82 | 0x4 | 0xYY02(1) | 0x0 | NA | 0x1 | 0x0 |

1. 0xYY can have five values (0: WRP area, 1: WRP1A, 2: WRP2A, 3: WRP1B, 4: WRP2B)

*Note:**	USB** **special** **commands** **are** **slightly** **different** **from** **the** **other** **protocols** **as** **per** **the** **USB** protocol specificities:*
  - *No** **Opcode** **is** **used,** **Sub-Opcode** **is** **used** **directly*
  - *Sub-Opcode** **is** **treated** **in** **a** **single** **byte** **and** **not** **two** **bytes*
  - *Data** **are** **sent** **on** **USB** **frame** **byte** **per** **byte.** **No** **need** **to** **add** **number** **of** **data** **to** **be** **transmitted*
  - *Returned** **data** **and** **status** **are** **formatted** **on** **the** **USB** **native** **protocol*

### Bootloader selection

[Figure 125](#_bookmark798)* *shows the bootloader selection mechanism.

**Figure** **126.** **Bootloader** **V9.x** **selection** **for** **STM32U5F7xx/F9xx/G7xx/G9xx**



### Bootloader version


**Table** **225.** **STM32U5F7xx/F9xx/G7xx/G9xx** **bootloader** **versions**
| Version number | Description | Known limitations |
| --- | --- | --- |
| V9.0 | Initial bootloader version | FDCAN Readout unprotect command does not send the command ID to the host |






The bootloader protocol command set and sequences for each serial peripheral are the same for all STM32 devices. Some parameters depend on device and bootloader version:
    - PID (Product ID)
    - Valid RAM addresses (RAM area used during bootloader execution is not accessible) accepted by the bootloader when the Read Memory, Go and Write Memory commands are requested.
    - System memory area.
[Table 226](#_bookmark810)* *shows the values of these parameters for each STM32 device.

**Table** **226.** **Bootloader** **device-dependent** **parameters**
| STM32 series | Device | PID | BL ID | RAM | System memory |
| --- | --- | --- | --- | --- | --- |
| C0 | STM32C011xx | 0x443 | 0x51 | 0x20000000 - 0x20002FFF | 0x1FFF0000 - 0x1FFF17FF |
|  | STM32C031xx | 0x453 | 0x52 | 0x20002000 - 0x200017FF |  |
|  | STM32C051xx | 0x44C | 0xB0 | 0x20001400 - 0x20002FFF | 0x1FFF0000 - 0x1FFF2FFF |
|  | STM32C071xx | 0x493 | 0xD1 | 0x20002300 - 0x20005FFF | 0x1FFF0000 - 0x1FFF6FFF |
|  | STM32C091xx/92xx | 0x44D | 0x121 | 0x20002400 - 0x200077FF | 0x1FFF0000 - 0x1FFF3FFF |
| C5 | STM32C55xxx/562xx | 0x44E | 0x101 | 0x20003C40 - 0x2001FFFF | 0x0BF80080 - 0x0BF885FF |
|  | STM32C53xxx/542xx | 0x44F | 0x100 | 0x20003C00 - 0x2000FFFF | 0x0BF80080 - 0x0BF885FF |
|  | STM32C5A3xx/59xxx | 0x45A | 0x100 | 0x20003C00 - 0x2003FFFF | 0x0BF80080 - 0x0BF885FF |



**Table** **226.** **Bootloader** **device-dependent** **parameters** **(continued)**
| STM32 series | Device | PID | BL ID | RAM | System memory |  |
| --- | --- | --- | --- | --- | --- | --- |
| F0 | STM32F05xxx and STM32F030x8 | 0x440 | 0x21 | 0x20000800 - 0x20001FFF | 0x1FFFEC00 - 0x1FFFF7FF |  |
|  | STM32F03xx4/6 | 0x444 | 0x10 | 0x20000800 - 0x20000FFF |  |  |
|  | STM32F030xC | 0x442 | 0x52 | 0x20001800 - 0x20007FFF | 0x1FFFD800 - 0x1FFFF7FF |  |
|  | STM32F04xxx | 0x445 | 0xA1 | NA | 0x1FFFC400 - 0x1FFFF7FF |  |
|  | STM32F070x6 | 0x445 | 0xA2 | NA | 0x1FFFC400 - 0x1FFFF7FF |  |
|  | STM32F070xB | 0x448 | 0xA2 | NA | 0x1FFFC800 - 0x1FFFF7FF |  |
|  | STM32F071xx/072xx | 0x448 | 0xA1 | 0x20001800 - 0x20003FFF | 0x1FFFC800 - 0x1FFFF7FF |  |
|  | STM32F09xxx | 0x442 | 0x50 | NA | 0x1FFFD800 - 0x1FFFF7FF |  |
| F1 | STM32F10xxx | Low-density | 0x412 | NA | 0x20000200 - 0x200027FF | 0x1FFFF000 - 0x1FFFF7FF |
|  |  | Medium-density | 0x410 | NA | 0x20000200 - 0x20004FFF |  |
|  |  | High-density | 0x414 | NA | 0x20000200 - 0x2000FFFF |  |
|  |  | Medium-density value line | 0x420 | 0x10 | 0x20000200 - 0x20001FFF |  |
|  |  | High-density value line | 0x428 | 0x10 | 0x20000200 - 0x20007FFF |  |
|  | STM32F105xx/107xx | 0x418 | NA | 0x20001000 - 0x2000FFFF | 0x1FFFB000 - 0x1FFFF7FF |  |
|  | STM32F10xxx XL-density | 0x430 | 0x21 | 0x20000800 - 0x20017FFF | 0x1FFFE000 - 0x1FFFF7FF |  |
| F2 | STM32F2xxxx | 0x411 | 0x20 | 0x20002000 - 0x2001FFFF | 0x1FFF0000 - 0x1FFF77FF |  |
|  |  |  | 0x33 |  |  |  |




| STM32 series | Device | PID | BL ID | RAM | System memory |
| --- | --- | --- | --- | --- | --- |
| F3 | STM32F373xx | 0x432 | 0x41 | 0x20001400 - 0x20007FFF | 0x1FFFD800 - 0x1FFFF7FF |
|  | STM32F378xx |  | 0x50 | 0x20001000 - 0x20007FFF |  |
|  | STM32F302xB(C)/303xB(C) | 0x422 | 0x41 | 0x20001400 - 0x20009FFF |  |
|  | STM32F358xx |  | 0x50 |  |  |
|  | STM32F301xx/302x4(6/8) | 0x439 | 0x40 | 0x20001800 - 0x20003FFF |  |
|  | STM32F318xx |  | 0x50 |  |  |
|  | STM32F303x4(6/8)/334xx/328xx | 0x438 | 0x50 | 0x20001800 - 0x20002FFF |  |
|  | STM32F302xD(E)/303xD(E) | 0x446 | 0x40 | 0x20001800 - 0x2000FFFF |  |
|  | STM32F398xx | 0x446 | 0x50 | 0x20001800 - 0x2000FFFF |  |
| F4 | STM32F40xxx/41xxx | 0x413 | 0x31 | 0x20002000 - 0x2001FFFF | 0x1FFF0000 - 0x1FFF77FF |
|  |  |  | 0x91 | 0x20003000 - 0x2001FFFF |  |
|  | STM32F42xxx/43xxx | 0x419 | 0x70 | 0x20003000 - 0x2002FFFF |  |
|  |  |  | 0x91 |  |  |
|  | STM32F401xB(C) | 0x423 | 0xD1 | 0x20003000 - 0x2000FFFF |  |
|  | STM32F401xD(E) | 0x433 | 0xD1 | 0x20003000 - 0x20017FFF |  |
|  | STM32F410xx | 0x458 | 0xB1 | 0x20003000 - 0x20007FFF |  |
|  | STM32F411xx | 0x431 | 0xD0 | 0x20003000 - 0x2001FFFF |  |
|  | STM32F412xx | 0x441 | 0x90 | 0x20003000 - 0x2003FFFF |  |
|  | STM32F446xx | 0x421 | 0x90 | 0x20003000 - 0x2001FFFF |  |
|  | STM32F469xx/479xx | 0x434 | 0x90 | 0x20003000 - 0x2005FFFF |  |
|  | STM32F413xx/423xx | 0x463 | 0x90 | 0x20003000 - 0x2004FFFF |  |



**Table** **226.** **Bootloader** **device-dependent** **parameters** **(continued)**
| STM32 series | Device | PID | BL ID | RAM | System memory |
| --- | --- | --- | --- | --- | --- |
| F7 | STM32F72xxx/73xxx | 0x452 | 0x90 | 0x20004000 - 0x2003FFFF | 0x1FF00000 - 0x1FF0EDBF |
|  | STM32F74xxx/75xxx | 0x449 | 0x70 | 0x20004000 - 0x2004FFFF | 0x1FF00000 - 0x1FF0EDBF |
|  |  |  | 0x90 | 0x20004000 - 0x2004FFFF | 0x1FF00000 - 0x1FF0EDBF |
|  | STM32F76xxx/77xxx | 0x451 | 0x93 | 0x20004000 - 0x2007FFFF | 0x1FF00000 - 0x1FF0EDBF |
| G0 | STM32G03xxx/04xxx | 0x466 | 0x54 | 0x20001000 - 0x20001FFF | 0x1FFF0000 - 0x1FFF1FFF |
|  | STM32G05xxx/061xx | 0x456 | 0x51 | 0x20001000 - 0x20002000 | 0x1FFF0000 - 0x1FFF1FFF |
|  | STM32G07xxx/08xxx | 0x460 | 0xB4 | 0x20002700 - 0x20009000 | 0x1FFF0000 - 0x1FFF6FFF |
|  | STM32G0B0xx | 0x467 | 0xD0 | 0x20004000 - 0x20020000 | 0x1FFF0000 - 0x1FFF6FFF 0x1FFF8000 - 0x1FFFEFFF |
|  | STM32G0B1xx/0C1xx | 0x467 | 0x92 | 0x20004000 - 0x20020000 | 0x1FFF0000 - 0x1FFF6FFF 0x1FFF8000 - 0x1FFFEFFF |
| G4 | STM32G431xx/441xx | 0x468 | 0xD4 | 0x20004000 – 0x20005800 | 0x1FFF0000 - 0x1FFF7000 |
|  | STM32G47xxx/48xxx | 0x469 | 0xD5 | 0x20004000 – 0x20018000 | 0x1FFF0000 - 0x1FFF7000 |
|  | STM32G491xx/A1xx | 0x479 | 0xD2 | 0x20004000 - 0x2001C000 | 0x1FFF0000 - 0x1FFF7000 |
| H5 | STM32H503xx | 0x474 | 0xE1 | 0x20004000 - 0x20007FFF | 0x0BF87000 - 0x0BF8FFFF |
|  | STM32H562xx/563xx/573xx | 0x484 | 0xE5 | 0x20000000 - 0x2009FFFF | 0x0BF97000 - 0x0BF9FFFF |
|  | STM32H523xx/533xx | 0x478 | 0xE2 | 0x20004000 - 0x20043FFF | 0x0BF97000 - 0x0BF9FFFF |
|  | STM32H5Ex/5Fx | 0x47A | 0xF0 | 0x20004000 - 0x2017FFFF | 0x0BFAC000 - 0x0BFB7FFF |




| STM32 series | Device | PID | BL ID | RAM | System memory |
| --- | --- | --- | --- | --- | --- |
| H7 | STM32H72xxx/73xxx | 0x483 | 0x93 | 0x20004100 - 0x2001FFFF 0x24004000 - 0x2404FFFF | 0x1FF00000 - 0x1FF1E7FF |
|  | STM32H74xxx/75xxx | 0x450 | 0x92 | 0x20004100 - 0x2001FFFF 0x24005000 - 0x2407FFFF | 0x1FF00000 - 0x1FF1E7FF |
|  | STM32H7A3xx/7B3xx/7B0xx | 0x480 | 0x92 | 0x20004100 - 0x2001FFFF 0x24034000 - 0x2407FFFF | 0x1FF00000 - 0x1FF13FFF |
|  | STM32H7Rxxx/7Sxxx | 0x485 | 0xE3 | 0x24000000 - 0x2401FFFF 0x24024000 - 0x24071FFF 0x20000000 - 0x2002FFFF 0x00000000 - 0x0002FFFF(1) | 0x1FF18000 - 0x1FF1FFFF |
| L0 | STM32L01xxx/02xxx | 0x457 | 0xC3 | NA | 0x1FF00000 - 0x1FF00FFF |
|  | STM32L031xx/041xx | 0x425 | 0xC0 | 0x20001000 - 0x20001FFF | 0x1FF00000 - 0x1FF00FFF |
|  | STM32L05xxx/06xxx | 0x417 | 0xC0 | 0x20001000 - 0x20001FFF | 0x1FF00000 - 0x1FF00FFF |
|  | STM32L07xxx/08xxx | 0x447 | 0x41 | 0x20001000 - 0x20004FFF | 0x1FF00000 - 0x1FF01FFF |
|  |  |  | 0xB2 | 0x20001400 - 0x20004FFF |  |
| L1 | STM32L1xxx6(8/B) | 0x416 | 0x20 | 0x20000800 - 0x20003FFF | 0x1FF00000 - 0x1FF01FFF |
|  | STM32L1xxx6(8/B)A | 0x429 | 0x20 | 0x20001000 - 0x20007FFF |  |
|  | STM32L1xxxC | 0x427 | 0x40 |  |  |
|  | STM32L1xxxD | 0x436 | 0x45 | 0x20001000 - 0x2000BFFF |  |
|  | STM32L1xxxE | 0x437 | 0x40 | 0x20001000 - 0x20013FFF |  |



**Table** **226.** **Bootloader** **device-dependent** **parameters** **(continued)**
| STM32 series | Device | PID | BL ID | RAM | System memory |
| --- | --- | --- | --- | --- | --- |
| L4 | STM32L412xx/422xx | 0x464 | 0xD1 | 0x20002100 - 0x20008000 | 0x1FFF 0000 - 0x1FFF6FFF |
|  | STM32L43xxx/44xxx | 0x435 | 0x91 | 0x20003100 - 0x2000BFFF | 0x1FFF 0000 - 0x1FFF6FFF |
|  | STM32L45xxx/46xxx | 0x462 | 0x92 | 0x20003100 - 0x2001FFFF | 0x1FFF 0000 - 0x1FFF6FFF |
|  | STM32L47xxx/48xxx | 0x415 | 0xA3 | 0x20003000 - 0x20017FFF | 0x1FFF 0000 - 0x1FFF6FFF |
|  |  |  | 0x92 | 0x20003100 - 0x20017FFF |  |
|  | STM32L496xx/4A6xx | 0x461 | 0x93 | 0x20003100 - 0x2003FFFF | 0x1FFF 0000 - 0x1FFF6FFF |
|  | STM32L4Rxx/4Sxx | 0x470 | 0x95 | 0x20003200 - 0x2009FFFF | 0x1FFF 0000 - 0x1FFF6FFF |
|  | STM32L4P5xx/Q5xx | 0x471 | 0x90 | 0x20004000 - 0x2004FFFF | 0x1FFF 0000 - 0x1FFF6FFF |
| L5 | STM32L552xx/562xx | 0x472 | 0x92 | 0x20004000 - 0x2003FFFF | 0x0BF9 0000 - 0x0BF9 7FFF |
| U0 | STM32U031xx | 0x459 | 0xB0 | 0x20001500 – 0x20002FFF | 0x1FFF 0000 – 0x1FFF 37FF |
|  | STM32U073xx/83xx | 0x489 | 0xD0 | 0x20002170 – 0x20009FFF | 0x1FFF 0000 – 0x1FFF 67FF |
| U3 | STM32U375xx/385xx | 0x454 | 0xE2 | 0x20004000 - 0x2003FFFF | 0x0BF8 F000 - 0x0BF9 FFFF |
|  | STM32U3B5xx/3C5xx | 0x42A | 0xE0 | 0x20004000 - 0x2009FFFF | 0x0BF8F000 - 0x0BF9FFFF |
| U5 | STM32U535xx/545xx | 0x455 | 0x91 | 0x20004000 - 0x2023FFFF | 0x0BF90000 - 0x0BF9FFFF |
|  | STM32U575xx/585xx | 0x482 | 0x92 | 0x20004000 - 0x200BFFFF | 0x0BF90000 - 0x0BF9FFFF |
|  | STM32U595xx/599xx/5A9xx | 0x481 | 0x92 | 0x20004000 - 0x2026FFFF | 0x0BF90000 - 0x0BF9FFFF |
|  | STM32U5F7xx/5F9xx/5G7xx/5G9xx | 0x476 | 0x90 | 0x20004000 - 0x202EFFFF | 0x0BF90000 - 0x0BF9FFFF |
| WB | STM32WB10xx/15xx | 0x494 | 0xB1 | 0x20005000 - 0x20040000 | 0x1FFF 0000 - 0x1FFF7000 |
|  | STM32WB30xx/35xx/50xx/WB55xx | 0x495 | 0xD5 | 0x20004000 - 0x2000BFFF | 0x1FFF 0000 - 0x1FFF7000 |




| STM32 series | Device | PID | BL ID | RAM | System memory |
| --- | --- | --- | --- | --- | --- |
| WBA | STM32WBA2xxx | 0x4B2 | 0xD0 | 0x20003000 - 0x20017FFF | 0x0BF85000 - 0x0BF8CDFF |
|  | STM32WBA5xxx | 0x492 | 0xB0 (rev A) 0xB1 (rev B) | 0x2000 1800 - 0x2000 1FFF | 0x0BF8 8000 - 0x0BF8 FFFF |
|  | STM32WBA62xx/63xx/64xx/65xx | 0x4B0 | 0xD2 | 0x2000 3000 - 0x2007 FFFF | 0x0BF9 0000 - 0x0BF9 FFFF |
| WL | STM32WLE5xx/WL55xx | 0x497 | 0xC4 | 0x2000 2000 - 0x2000 FFFF | 0x1FFF 0000 - 0x1FFF3FFF |

1. Addresses are listed with the max values, but depending on option bytes, the end values can change.

## Bootloader timings


This section details the timings of the bootloader firmware to use for correct synchronization between the host and the STM32 device.
Two types of timings are described, namely STM32 device bootloader resources initialization duration, and communication interface selection duration.
After these timings the bootloader is ready to receive and execute host commands.


### Bootloader startup timing

After bootloader reset, the host must wait until the STM32 bootloader is ready to start detection phase with a specific interface communication. This time corresponds to bootloader startup timing, during which resources used by bootloader are initialized.

**![](rId3224)**Figure** **127.** **Bootloader** **startup** **timing** **description**
Depending on the bootloader model, the startup timing calculation differs from one product to another (see [Section 4.10](#_bookmark35)* *for more details). The following table details only the startup timings.

**Table** **227.** **Bootloader** **startup** **timings** **(ms)**
| Device | Minimum startup | HSE timeout |
| --- | --- | --- |
| STM32C011xx | 2.1 | NA |
| STM32C031xx | 2.1 | NA |
| STM32C051xx | 2.262 | NA |
| STM32C071xx | 2.358 | NA |
| STM32C091xx/92xx | 1.527 | NA |
| STM32C5A3xx/59xxx | 4.8 | 12 |
| STM32C55xxx/562xx | 4.8 | 12 |




| Device | Minimum startup | HSE timeout |  |
| --- | --- | --- | --- |
| STM32C53xxx/542xx | 4.8 | 12 |  |
| STM32F03xx4/6 | 1.612 | NA |  |
| STM32F05xxx and STM32F030x8 devices | 1.612 | NA |  |
| STM32F04xxx | 0.058 | NA |  |
| STM32F071xx/072xx | 0.058 | NA |  |
| STM32F070x6 | HSE connected | 3 | 200 |
|  | HSE not connected | 230 |  |
| STM32F070xB | HSE connected | 6 | 200 |
|  | HSE not connected | 230 |  |
| STM32F09xxx | 2 | NA |  |
| STM32F030xC | 2 | NA |  |
| STM32F10xxx | 1.227 | NA |  |
| STM32F105xx/107xx | PA9 pin low | 1.396 | NA |
|  | PA9 pin high | 524.376 |  |
| STM32F10xxx XL-density | 1.227 | NA |  |
| STM32F2xxxx | V2.x | 134 | NA |
|  | V3.x | 84.59 | 0.790 |
| STM32F301xx/302x4(6/8) | HSE connected | 45 | 560.5 |
|  | HSE not connected | 560.8 |  |
| STM32F302xB(C)/303xB(C) | HSE connected | 43.4 | 2.236 |
|  | HSE not connected | 2.36 |  |
| STM32F302xD(E)/303xD | HSE connected | 7.53 | NA |
|  | HSE not connected | 146.71 | NA |
| STM32F303x4(6/8)/334xx/328xx | 0.155 | NA |  |
| STM32F318xx | 0.182 | NA |  |
| STM32F358xx | 1.542 | NA |  |
| STM32F373xx | HSE connected | 43.4 | 2.236 |
|  | HSE not connected | 2.36 |  |
| STM32F378xx | 1.542 | NA |  |
| STM32F398xx | 1.72 | NA |  |
| STM32F40xxx/41xxx | V3.x | 84.59 | 0.790 |
|  | V9.x | 74 | 96 |
| STM32F401xB(C) | 74.5 | 85 |  |
| STM32F401xD(E) | 74.5 | 85 |  |
| STM32F410xx | 0.614 | NA |  |



**Table** **227.** **Bootloader** **startup** **timings** **(ms)** **(continued)**
| Device | Minimum startup | HSE timeout |  |
| --- | --- | --- | --- |
| STM32F411xx | 74.5 | 85 |  |
| STM32F412xx | 0.614 | 180 |  |
| STM32F413xx/423xx | 0.642 | 165 |  |
| STM32F429xx/439xx | V7.x | 82 | 97 |
|  | V9.x | 74 | 97 |
| STM32F446xx | 73.61 | 96 |  |
| STM32F469xx/479xx | 73.68 | 230 |  |
| STM32F72xxx/73xxx | 17.93 | 50 |  |
| STM32F74xxx/75xxx | 16.63 | 50 |  |
| STM32G03xxx/04xxx | 0.390 | NA |  |
| STM32G07xxx/08xxx | 0.390 | NA |  |
| STM32G0Bxxx/Cxxx | 0.390 | NA |  |
| STM32G05xxx/061xx | 0.390 | NA |  |
| STM32G4xxxx | 0.390 | NA |  |
| STM32H503xx | 1.5 | NA |  |
| STM32H523xx/33xx | 2.7 | NA |  |
| STM32H562xx/63xx/73xx | 1.8 | NA |  |
| STM32H5Ex/5Fx | 11.7 | 200 |  |
| STM32H72xxx/73xxx | 53.975 | NA |  |
| STM32H74xxx/75xxx | 53.975 | 2 |  |
| STM32H7A3xx/7B3xx/7B0xx | 545 | NA |  |
| STM32L01xxx/02xxx | 0.63 | NA |  |
| STM32L031xx/041xx | 0.62 | NA |  |
| STM32L05xxx/06xxx | 0.22 | NA |  |
| STM32L07xxx/08xxx | V4.x | 0.61 | NA |
|  | V11.x | 0.71 | NA |
| STM32L1xxx6(8/B)A | 0.542 | NA |  |
| STM32L1xxx6(8/B) | 0.542 | NA |  |
| STM32L1xxxC | 0.708 | 80 |  |
| STM32L1xxxD | 0.708 | 80 |  |
| STM32L1xxxE | 0.708 | 200 |  |
| STM32L43xxx/44xxx | 0.86 | 100 |  |
| STM32L45xxx/46xxx | 0.86 | NA |  |




| Device | Minimum startup | HSE timeout |  |  |
| --- | --- | --- | --- | --- |
| STM32L47xxx/48xxx | V10.x | LSE connected | 55 | 100 |
|  |  | LSE not connected | 2560 |  |
|  | V9.x | LSE connected | 55.40 | 100 |
|  |  | LSE not connected | 2560.5 |  |
| STM32L412xx/422xx | 0.86 | NA |  |  |
| STM32L496xx/4A6xx | 76.93 | 100 |  |  |
| STM32L4P5xx /Q5xx | 9.891 | NA |  |  |
| STM32L4Rxx/4Sxx | 10.12 | NA |  |  |
| STM32L552xx/562xx | 0.390 | NA |  |  |
| STM32U031xx | 4.534 | NA |  |  |
| STM32U073xx/ STM32U083xx | 5.626 | NA |  |  |
| STM32U375xx/385xx | 4.418 | NA |  |  |
| STM32U3B5xx/3C5xx | 4.5 | NA |  |  |
| STM32U535xx/545xx | 0.390 | NA |  |  |
| STM32U575xx/585xx | 0.390 | NA |  |  |
| STM32U595xx/599xx/5A5xx/5A9xx | 0.390 | NA |  |  |
| STM32U5F7xx/5F9xx/5G7xx/5G9xx | 0.390 | NA |  |  |
| STM32WB10xx/15xx/30xx/35xx/50xx/55xx | 0.390 | NA |  |  |
| STM32WBA2xxx | 2.3 | NA |  |  |
| STM32WBA52xx | 0.390 | NA |  |  |
| STM32WBA62xx/63xx/64xx/65xx | 2,73 | NA |  |  |
| STM32WLE5xx/WL55xx | 0.390 | NA |  |  |


### USART connection timing

USART connection timing is the time that the host must wait for between sending the synchronization data (0x7F) and receiving the first acknowledge response (0x79).


**Figure** **128.** **USART** **connection** **timing** **description**
    1. Receiving characters different from 0x7F (or line glitches) causes bootloader to start communication using a wrong baudrate. Bootloader measures the signal length between rising edge of the first bit to the falling edge of the last bit to deduce the baudrate value
    1. Bootloader does not realign the calculated baudrate to standard baudrate values (i.e. 1200, 9600, 115200).


*Note:**	The** **PA9** **pin** **(USB_VBUS)** **on** **STM32F105xx/107xx** **devices** **is** **used** **to** **detect** **the** **USB** **host** connection.** **The** **initialization** **of** **USB** **peripheral** **is** **performed** **only** **if** **PA9** **is** **high** **at** **detection phase,** **which** **means** **that** **a** **host** **is** **connected** **to** **the** **port** **and** **delivering** **5** **V** **on** **the** **USB** **bus. When** **PA9** **level** **is** **high** **at** **detection** **phase,** **more** **time** **is** **required** **to** **initialize** **and** **shutdown the** **USB** **peripheral.** **To** **minimize** **bootloader** **detection** **time** **when** **PA9** **pin** **is** **not** **used,** **keep PA9** **low** **during** **USART** **detection** **phase,** **from** **the** **moment** **the** **device** **is** **reset,** **until** **a** **device ACK is sent.*

**Table** **228.** **USART** **bootloader** **minimum** **timings** **(ms)**
| Device | One USART byte sending | USART configuration | USART connection |
| --- | --- | --- | --- |
| STM32C011xx | 0.138 | 0.043 | 0.182 |
| STM32C031xx | 0.112 | 0.028 | 0.168 |
| STM32C051xx | 0.1 | 0.033 | 0.23 |
| STM32C071xx | 0.1 | 0.104 | 0.182 |
| STM32C091xx/92xx | 0.1 | 0.102 | 0.383 |
| STM32C5A3xx/59xxx | 0.013188 | 0.02045 | 0.013188 |
| STM32C55xxx/562xx | 0.010076 | 0.08032 | 0.010076 |
| STM32C53xxx/542xx | 0.012761 | 0.018122 | 0.015346 |
| STM32F03xx4/6 | 0.078125 | 0.0064 | 0.16265 |
| STM32F05xxx and STM32F030x8 devices | 0.078125 | 0.0095 | 0.16575 |
| STM32F04xxx | 0.078125 | 0.007 | 0.16325 |




| Device | One USART byte sending | USART configuration | USART connection |  |
| --- | --- | --- | --- | --- |
| STM32F071xx/072xx | 0.078125 | 0.007 | 0.16325 |  |
| STM32F070x6 | 0.078125 | 0.014 | 0.17 |  |
| STM32F070xB | 0.078125 | 0.08 | 0.23 |  |
| STM32F09xxx | 0.078125 | 0.07 | 0.22 |  |
| STM32F030xC | 0.078125 | 0.07 | 0.22 |  |
| STM32F10xxx | 0.078125 | 0.002 | 0.15825 |  |
| STM32F105xx/107xx | PA9 pin low | 0.078125 | 0.007 | 0.16325 |
|  | PA9 pin High |  | 105 | 105.15625 |
| STM32F10xxx XL-density | 0.078125 | 0.006 | 0.16225 |  |
| STM32F2xxxx | V2.x | 0.078125 | 0.009 | 0.16525 |
|  | V3.x |  |  |  |
| STM32F301xx/302x4(6/8) | HSE connected | 0.078125 | 0.002 | 0.15825 |
|  | HSE not connected |  |  |  |
| STM32F302xB(C)/303xB(C) | HSE connected | 0.078125 | 0.002 | 0.15825 |
|  | HSE not connected |  |  |  |
| STM32F302xD(E)/303xD | 0.078125 | 0.002 | 0.15885 |  |
| STM32F303x4(6/8)/334xx/328xx | 0.078125 | 0.002 | 0.15825 |  |
| STM32F318xx | 0.078125 | 0.002 | 0.15825 |  |
| STM32F358xx | 0.15625 | 0.001 | 0.3135 |  |
| STM32F373xx | HSE connected | 0.078125 | 0.002 | 0.15825 |
|  | HSE not connected |  |  |  |
| STM32F378xx | 0.15625 | 0.001 | 0.3135 |  |
| STM32F398xx | 0.078125 | 0.002 | 0.15885 |  |
| STM32F40xxx/41xxx | V3.x | 0.078125 | 0.009 | 0.16525 |
|  | V9.x |  | 0.0035 | 0.15975 |
| STM32F401xB(C) | 0.078125 | 0.00326 | 0.15951 |  |
| STM32F401xD(E) | 0.078125 | 0.00326 | 0.15951 |  |
| STM32F410xx | 0.078125 | 0.002 | 0.158 |  |
| STM32F411xx | 0.078125 | 0.00326 | 0.15951 |  |
| STM32F412xx | 0.078125 | 0.002 | 0.158 |  |
| STM32F413xx/423xx | 0.078125 | 0.002 | 0.158 |  |
| STM32F429xx/439xx | V7.x | 0.078125 | 0.007 | 0.16325 |
|  | V9.x |  | 0.00326 | 0.15951 |
| STM32F446xx | 0.078125 | 0.004 | 0.16 |  |



**Table** **228.** **USART** **bootloader** **minimum** **timings** **(ms)** **(continued)**
| Device | One USART byte sending | USART configuration | USART connection |  |
| --- | --- | --- | --- | --- |
| STM32F469xx/479xx | 0.078125 | 0.003 | 0.159 |  |
| STM32F72xxx/73xxx | 0.078125 | 0.070 | 0.22 |  |
| STM32F74xxx/75xxx | 0.078125 | 0.065 | 0.22 |  |
| STM32G03xxx/04xxx | 0.078125 | 0.01 | 0.11 |  |
| STM32G07xxx/08xxx | 0.078125 | 0.01 | 0.11 |  |
| STM32G0Bxxx/Cxxx | 0.078125 | 0.01 | 0.11 |  |
| STM32G05xxx/061xx | 0.078125 | 0.01 | 0.11 |  |
| STM32G4xxxx | 0.078125 | 0.003 | 0.159 |  |
| STM32H503xx | 0.048 | 0.05 | 0.101 |  |
| STM32H562xx/63xx/73xx | 0.047 | 0.06 | 0.100 |  |
| STM32H5Ex/5Fx | 0.012784 | 0.003048 | 0.012784 |  |
| STM32H72xxx/73xxx | 0.078125 | 0.072 | 0.22825 |  |
| STM32H74xxx/75xxx | 0.078125 | 0.072 | 0.22825 |  |
| STM32H7A3xx/7B3xx/7B0xx | 0.078125 | 0.072 | 0.22825 |  |
| STM32L01xxx/02xxx | 0.078125 | 0.016 | 0.17 |  |
| STM32L031xx/041xx | 0.078125 | 0.018 | 0.174 |  |
| STM32L05xxx/06xxx | 0.078125 | 0.018 | 0.17425 |  |
| STM32L07xxx/08xxx | V4.x | 0.078125 | 0.017 | 0.173 |
|  | V11.x | 0.078125 | 0.017 | 0.158 |
| STM32L1xxx6(8/B)A | 0.078125 | 0.008 | 0.16425 |  |
| STM32L1xxx6(8/B) | 0.078125 | 0.008 | 0.16425 |  |
| STM32L1xxxC | 0.078125 | 0.008 | 0.16425 |  |
| STM32L1xxxD | 0.078125 | 0.008 | 0.16425 |  |
| STM32L1xxxE | 0.078125 | 0.008 | 0.16425 |  |
| STM32L412xx/422xx | 0.078125 | 0.005 | 0.2 |  |
| STM32L43xxx/44xxx | 0.078125 | 0.003 | 0.159 |  |
| STM32L45xxx/46xxx | 0.078125 | 0.07 | 0.22 |  |
| STM32L47xxx/48xxx | V10.x | 0.078125 | 0.003 | 0.159 |
|  | V9.x | 0.078125 | 0.003 | 0.159 |
| STM32L496xx/4A6xx | 0.078125 | 0.003 | 0.159 |  |
| STM32L4Rxx/4Sxx | 0.0062 | 0.0235 | 0.0307 |  |
| STM32L4P5xx/4Q5xx | 0.0062 | 0.0235 | 0.0307 |  |
| STM32L552xx/562xx | 0.078125 | 0.01 | 0.11 |  |
| STM32U031xx | 0.012 | 0.050 | 0.062 |  |




| Device | One USART byte sending | USART configuration | USART connection |
| --- | --- | --- | --- |
| STM32U073xx/STM32U083xx | 0.014 | 0.049 | 0.077 |
| STM32U031xx | 0.012 | 0.050 | 0.062 |
| STM32U3B5xx/3C5xx | 0.0128125 | 0.00624 | 0.0128125 |
| STM32U535xx/545xx | 0.078125 | 0.001 | NA |
| STM32U575xx/585xx | 0.078125 | 0.001 | NA |
| STM32U595xx/599xx/5A5xx/5A9xx | 0.078125 | 0.001 | NA |
| STM32U5F7xx/5F9xx/5G7xx/5G9xx | 0.078125 | 0.001 | NA |
| STM32WB10xx/15xx/30xx/35xx/50xx/55xx | 0.078125 | 0.003 | 0.159 |
| STM32WBA2xxx | 0.078125 | 0.001 | 0.110 |
| STM32WBA52xx | 0.078125 | 0.001 | NA |
| STM32WBA62xx/63xx/64xx/65xx | 0.102 | 0.004 | 0.106 |
| STM32WLE5xx/WL55xx | 0.078125 | 0.001 | 0.110 |


### USB connection timing

This is the time that the host must wait for between plugging the USB cable and establishing a correct connection with the device. It includes enumeration and DFU components configuration. The USB connection depends upon the host.

**Figure** **129.** **USB** **connection** **timing** **description**
*Note:**	For STM32F105xx/107xx devices, if the external HSE crystal frequency is different from** **25 MHz** **(14.7456** **or** **8** **MHz), the** **device** **performs several unsuccessful** **enumerations** **(with connect/disconnect** **sequences)** **before** **establishing** **a** **correct** **connection** **with** **the** **host.** **This is due to the HSE detection mechanism based on Start Of Frame (SOF) detection.*


**Table** **229.** **USB** **bootloader** **minimum** **timings** **(ms)**
| Device | USB connection |  |
| --- | --- | --- |
| STM32C071xx | 552 |  |
| STM32C5A3xx/59xxx | 140 |  |
| STM32C55xxx/562xx | 140 |  |
| STM32C53xxx/542xx | 140 |  |
| STM32F04xxx | 350 |  |
| STM32F070x6 | TBD |  |
| STM32F070xB | 320 |  |
| STM32F105xx/107xx | HSE = 25 MHz | 460 |
|  | HSE = 14.7465 MHz | 4500 |
|  | HSE = 8 MHz | 13700 |
| STM32F2xxxx | 270 |  |
| STM32F301xx/302x4(6/8) | 300 |  |
| STM32F302xB(C)/303xB(C) | 300 |  |
| STM32F302xD(E)/303xD | 100 |  |
| STM32F373xx | 300 |  |
| STM32F40xxx/41xxx | V3.x | 270 |
|  | V9.x | 250 |
| STM32F401xB(C) | 250 |  |
| STM32F401xD(E) | 250 |  |
| STM32F411xx | 250 |  |
| STM32F412xx | 380 |  |
| STM32F413xx/423xx | 350 |  |
| STM32F429xx/439xx | V7.x | 250 |
|  | V9.x |  |
| STM32F446xx | 200 |  |
| STM32F469xx/479xx | 270 |  |
| STM32F72xxx/73xxx | 320 |  |
| STM32F74xxx/75xxx | 230 |  |
| STM32G0B1xx/C1xx | 300 |  |
| STM32G4xxxx | 300 |  |
| STM32H503xx | 251 |  |
| STM32H562xx/63xx/73xx | 245 |  |
| STM32H5Ex/5Fx | 217 |  |
| STM32H72xxx/73xxx | 53.9764 |  |
| STM32H74xxx/75xxx | 53.9764 |  |




| Device | USB connection |  |
| --- | --- | --- |
| STM327A3xx/7B3xx/7B0xx | 53.9764 |  |
| STM32L07xxx/08xxx | 140 |  |
| STM32L1xxxC | 849 |  |
| STM32L1xxxD | 849 |  |
| STM32L412xx/422xx | 820 |  |
| STM32L43xxx/44xxx | 820 |  |
| STM32L45xxx/46xxx | 330 |  |
| STM32L47xxx/48xxx | V10.x | 300 |
|  | V9.x |  |
| STM32L496xx/4A6xx | 430 |  |
| STM32L4P5xx/4Q5xx | 322 |  |
| STM32L4Rxx/4Sxx | 322 |  |
| STM32L552xx/L562xx | 300 |  |
| STM32U031xx | NA |  |
| STM32U073xx/ STM32U083xx | 241 |  |
| STM32U375xx/385xx | 210 |  |
| STM32U3B5xx/3C5xx | 210 |  |
| STM32U535xx/545xx | 300 |  |
| STM32U575xx/585xx | 300 |  |
| STM32U595xx/599xx/5A5xx/5A9xx | 300 |  |
| STM32U5F7xx/5F9xx/5G7xx/5G9xx | 300 |  |
| STM32WB30xx/35xx/50xx/55xx | 300 |  |
| STM32WBA2xxx |  | 180 |
| STM32WBA62xx/63xx/64xx/65xx | 69 |  |


### I2C connection timing

I2C connection timing is the time that the host must wait for between sending I2C device address and sending command code. This timing includes I2C line stretching duration.


**Figure** **130.** **I2C** **connection** **timing** **description**
*Note:**	For I2C communication, a timeout mechanism is implemented and must be respected to** execute bootloader commands correctly. This timeout is implemented between two I2C frames in the same command (example: for Write memory command, a timeout is inserted between** **command** **sending** **frame** **and** **address** **memory** **sending** **frame).** **The** **same** **timeout period** **is** **inserted** **between** **two** **successive** **data** **receptions** **or** **transmissions** **in** **the** **same** **I2C frame.** **If** **the** **timeout** **period** **elapses,** **a** **system** **reset** **is** **generated** **to** **avoid** **bootloader** **crash.*
*In** **Erase** **memory** **and** **Read-out** **unprotect** **commands,** **consider** **the** **duration** **of** **the** **operation** when implementing the host side.** **After sending the code of pages to erase, the host must wait until the bootloader device performs page erasing to complete the remaining steps of erase command.*

**Table** **230.** **I2C** **bootloader** **minimum** **timings** **(ms)**
| Device | Start condition + one I2C byte sending | I2C line stretching | I2C connection | I2C timeout |
| --- | --- | --- | --- | --- |
| STM32C011xx | 0.254 | 0.004 | 0.060 | 2000 |
| STM32C031xx | 0.028 | 0.003 | 0.031 | 2000 |
| STM32C051xx | 0.031 | 0.019 | 0.050 | 2200 |
| STM32C071xx | 0.028 | 0.017 | 0.046 | 2000 |
| STM32C091xx/92xx | 0.031 | 0.018 | 0.049 | 2000 |
| STM32F030xC | 0.0225 | 0.0025 | 0.0250 | 1000 |
| STM32F04xxx | 0.0225 | 0.0025 | 0.0250 | 1000 |
| STM32F070x6 | 0.0225 | 0.0025 | 0.0245 | 1000 |
| STM32F070xB | 0.0225 | 0.0025 | 0.0245 | 1000 |
| STM32F071xx/072xx | 0.0225 | 0.0025 | 0.0250 | 1000 |
| STM32F09xxx | 0.0225 | 0.0025 | 0.0245 | 1000 |




| Device | Start condition + one I2C byte sending | I2C line stretching | I2C connection | I2C timeout |  |
| --- | --- | --- | --- | --- | --- |
| STM32F303x4(6/8)/334xx/328xx | 0.0225 | 0.0027 | 0.0252 | 1000 |  |
| STM32F318xx | 0.0225 | 0.0027 | 0.0252 | 1000 |  |
| STM32F358xx | 0.0225 | 0.0055 | 0.0280 | 10 |  |
| STM32F378xx | 0.0225 | 0.0055 | 0.0280 | 10 |  |
| STM32F398xx | 0.0225 | 0.0020 | 0.0245 | 1500 |  |
| STM32F40xxx/41xxx | 0.0225 | 0.0022 | 0.0247 | 1000 |  |
| STM32F401xB(C) | 0.0225 | 0.0022 | 0.0247 | 1000 |  |
| STM32F401xD(E) | 0.0225 | 0.0022 | 0.0247 | 1000 |  |
| STM32F410xx | 0.0225 | 0.0020 | 0.0245 | 1000 |  |
| STM32F411xx | 0.0225 | 0.0022 | 0.0247 | 1000 |  |
| STM32F412xx | 0.0225 | 0.0020 | 0.0245 | 1000 |  |
| STM32F413xx/423xx | 0.0225 | 0.0020 | 0.0245 | 1000 |  |
| STM32F42xxx/43xxx | V7.x | 0.0225 | 0.0033 | 0.0258 | 1000 |
|  | V9.x | 0.0225 | 0.0022 | 0.0247 | 1000 |
| STM32F446xx | 0.0225 | 0.0020 | 0.0245 | 1000 |  |
| STM32F469xx/479xx | 0.0225 | 0.0020 | 0.0245 | 1000 |  |
| STM32F72xxx/73xxx | 0.0225 | 0.0020 | 0.0245 | 1000 |  |
| STM32F74xxx/75xxx | 0.0225 | 0.0020 | 0.0245 | 500 |  |
| STM32G03xxx/04xxx | 0.0225 | 0.0020 | 0.0245 | 1000 |  |
| STM32G07xxx/08xxx | 0.0225 | 0.0020 | 0.0245 | 1000 |  |
| STM32G0Bxx/Cxx | 0.0225 | 0.0020 | 0.0245 | 1000 |  |
| STM32G05xxx/061xx | 0.0225 | 0.0020 | 0.0245 | 1000 |  |
| STM32G4xxxx | 0.0225 | 0.0020 | 0.0245 | 1000 |  |
| STM32H503xx | 0.038 | 0.03 | 0.041 | 1000 |  |
| STM32H562xx/63xx/73xx | 0.039 | 0.02 | 0.041 | 1000 |  |
| STM32H5Ex/5Fx | 0.0048 | 0.000005 | 0.003428 | 1000 |  |
| STM32H72xxx/73xxx | 0.0225 | 0.05 | 0.0745 | 1000 |  |
| STM32H74xxx/75xxx | 0.0225 | 0.05 | 0.0725 | 1000 |  |
| STM32H7A3xx/7B3xx/7B0xx | 0.0225 | 0.05 | 0.0745 | 1000 |  |
| STM32L07xxx/08xxx | 0.0225 | 0.0020 | 0.0245 | 1000 |  |
| STM32L412xx/422xx | 0.0225 | 0.0020 | 0.o245 | 1000 |  |
| STM32L43xxx/44xxx | 0.0225 | 0.0020 | 0.0245 | 1000 |  |
| STM32L45xxx/46xxx | 0.0225 | 0.0020 | 0.0245 | 1000 |  |



**Table** **230.** **I2C** **bootloader** **minimum** **timings** **(ms)** **(continued)**
| Device | Start condition + one I2C byte sending | I2C line stretching | I2C connection | I2C timeout |  |
| --- | --- | --- | --- | --- | --- |
| STM32L47xxx/48xxx | V10.x | 0.0225 | 0.0020 | 0.0245 | 1000 |
|  | V9.x | 0.0225 | 0.0020 | 0.0245 | 1000 |
| STM32L496xx/4A6xx | 0.0225 | 0.0020 | 0.0245 | 1000 |  |
| STM32L4P5xx/4Q5xx | 0.0109 | 0.0020 | 0.0642 | 1000 |  |
| STM32L4Rxx/4Sxx | 0.0109 | 0.0020 | 0.0642 | 1000 |  |
| STM32L552xx/L562xx | 0.0225 | 0.0020 | 0.0245 | 1000 |  |
| STM32U031xx | 0.035 | 0.019 | 0.106 | 1000 |  |
| STM32U073xx/ STM32U083xx | 0.016 | 0.019 | 0.024 | 1000 |  |
| STM32U375xx/385xx | 0.021 | 0.018 | 0.092 | 1000 |  |
| STM32U3B5xx/3C5xx | 0.0.026 | 0.0168 | 0.10288 | 1000 |  |
| STM32U535xx/545xx | 0.0225 | 0.0020 | 0.0245 | 1000 |  |
| STM32U575xx/585xx | 0.0225 | 0.0020 | 0.0245 | 1000 |  |
| STM32U595xx/599xx/5A5xx/5A9xx | 0.0225 | 0.0020 | 0.0245 | 1000 |  |
| STM32U5F7xx/5F9xx/5G7xx/5G9xx | 0.0225 | 0.0020 | 0.0245 | 1000 |  |
| STM32WB10xx/15xx/30xx/35xx/50xx/55xx | 0.0225 | 0.0020 | 0.0245 | 1000 |  |
| STM32WBA2xxx | 0.003 | 0.019 | 0.539 | 1000 |  |
| STM32WBA52xx | 0.0225 | 0.0020 | 0.0245 | 1000 |  |
| STM32WBA62xx/63xx/64xx/65xx | 0.003 | 0.019 | 0.539 | 1000 |  |





SPI connection timing is the time that the host must wait for between sending the synchronization data (0xA5) and receiving the first acknowledge response (0x79).

**Figure** **131.** **SPI** **connection** **timing** **description**


**Table** **231.** **SPI** **bootloader** **minimum** **timings** **(ms)** **for** **STM32** **devices**
| Device | One SPI byte sending | Delay between two bytes | SPI connection |
| --- | --- | --- | --- |
| All products | 0.001 | 0.008 | 0.01 |







/**
**
**
* @file	main.c
**
**
*/

/* Includes
---*/
#include main.h

/* Private function prototypes
---*/
static void ConfigClock(void);

void JUMP_WITHOUT_PARAM(uint32_t jump_address);
void JUMP_WITH_PARAM(uint32_t jump_address, uint32_t magic, uint32_t applicationVectorAddress);

/* Private functions
---*/

/**
* @brief Main program
* @param None
* @retval None
*/
int main(void)
{
ConfigClock();

uint32_t application_address		= 0x08000800; uint32_t exit_secure_memory_address	= 0x1FFF1E00;
uint32_t magic_number		= 0x08192A3C; uint32_t exit_with_magic_number	= 0x0;

if (exit_with_magic_number)
{
JUMP_WITH_PARAM(exit_secure_memory_address, magic_number, application_address);
}
else
{


JUMP_WITHOUT_PARAM(exit_secure_memory_address);
}
}

/**
* @brief ConfigClock
* @param None
* @retval None
*/
static void ConfigClock(void)
{
/* Will be developped as per the template of the needed project */
}

/**
* @brief JUMP_WITHOUT_PARAM
* @param jump_address
* @retval None
*/
void JUMP_WITHOUT_PARAM(uint32_t jump_address)
{
asm (LDR R1, [R0]);	// jump_address asm (LDR R2, [R0,#4]);
asm (MOV SP, R1);
asm (BX R2);
}

/**
* @brief JUMP_WITH_PARAM
* @param jump_address, magic, applicationVectorAddress
* @retval None
*/
void JUMP_WITH_PARAM(uint32_t jump_address, uint32_t magic, uint32_t applicationVectorAddress))
{
asm (MOV R3, R0);	// jump_address asm (LDR R0, [R3]);
asm (MOV SP, R0);
asm (LDR R0, [R3,#4]); asm (BX R0);
}

/** (C) COPYRIGHT STMicroelectronics ***END OF FILE**/






/**

**
**
* @file	main.c

**
**
*/

/* Includes
---*/
#include main.h

/* Private function prototypes
---*/
static void ConfigClock(void);
static void Jump_Without_Param(uint32_t exit_secure_address, uint32_t dummy1, uint32_t dummy2, uint8_t mpu_region_number);
static void Jump_With_Param(uint32_t exit_secure_address, uint32_t magic, uint32_t application_address, uint8_t mpu_region_number);

/* Private functions
---*/

/**
* @brief Main program.
* @retval None.
*/
int main(void)
{
ConfigClock();

uint32_t application_address = 0x08008000; uint32_t exit_secure_address = 0x1FFF6000; uint8_t mpu_region_number	= 0x04; uint32_t magic_number	= 0x08192A3C; uint32_t with_magic_number	= 0x0;

if (with_magic_number)
{
Jump_With_Param(exit_sticky_address, magic_number, application_address, mpu_region_number);
}


else
{
Jump_Without_Param(exit_sticky_address, 0x0, 0x0, mpu_region_number);
}
}

/**
* @brief Configure system clocks.
* @retval None.
*/
static void ConfigClock(void)
{
/* Will be developped as per the template of the needed project */
}

/**
* @brief Jump to secure exit memory without magic number and user address.
* @param exit_secure_address Address of exit secure memory.
* @param dummy1 Not used.
* @param dummy2 Not used.
* @param mpu_region_number MPU region to enable.
* @retval None.
*/
static void Jump_Without_Param(uint32_t exit_secure_address, uint32_t dummy1, uint32_t dummy2, uint8_t mpu_region_number)
{
/**
* R0 = exit_secure_address -- Exit secure memory stack pointer
* R1 = dummy1	-- Dummy data
* R2 = dummy2	-- Dummy data
* R3 = mpu_region_number	-- MPU region number
*
* NOTE: Assume R1 and R2 registers are useless so can be moified, but R3 is used for MPU region number and must not be changed
*/
asm (LDR R1, [R0]);	// Load stack pointer (content of address pointed by R0) in R1
asm (LDR R2, [R0,#4]); // Load jump address (content of address pointed by R4 + 4) in R2
asm (MOV SP, R1);	// Change stack pointer register with value from R1
asm (BX R2);	// Jump to address pointed by R2
}

/**



- @param exit_secure_address Address of exit secure memory.
- @param magic Magic number value.
- @param application_address Application address.
- @param mpu_region_number MPU region to enable.
- @retval None
*/
static void Jump_With_Param(uint32_t exit_secure_address, uint32_t magic, uint32_t application_address, uint8_t mpu_region_number)
{
/**
* R0 = exit_secure_address -- Exit secure memory stack pointer
* R1 = magic	-- Magic number
* R2 = application_address -- User application start address
* R3 = mpu_region_number	-- MPU region number
*
* NOTE: R1, R2 and R3 registers must not be changed in below code
*/
asm (MOV R4, R0);	// Backup R0 in R4
asm (LDR R0, [R4]);	// Load stack pointer (content of address pointed by R4) in R0
asm (MOV SP, R0);	// Change stack pointer register with value from R0
asm (LDR R0, [R4,#4]); // Load jump address (content of address pointed by R4 + 4) in R0
asm (BX R0);	// Jump to address pointed by R0

## Revision history


**Table** **232.** **Document** **revision** **history**
| Date | Revision | Changes |
| --- | --- | --- |
| 21-Feb-2019 | 36 | Updated Table 1: Applicable products, Section 3: Glossary, Table 3: Embedded bootloaders, Table 226: Bootloader device-dependent parameters, Table 227: Bootloader startup timings (ms), Table 228: USART bootloader minimum timings (ms), Table 229: USB bootloader minimum timings (ms), Table 230: I2C bootloader minimum timings (ms). Added Section 81: STM32WB30xx/35xx/50xx/55xx devices |
| 06-May-2019 | 37 | Updated Table 1: Applicable products, Section 3: Glossary, Table 226: Bootloader device-dependent parameters, Table 227: Bootloader startup timings (ms), Table 228: USART bootloader minimum timings (ms), Table 229: USB bootloader minimum timings (ms), Table 230: I2C bootloader minimum timings (ms). Added Section 52: STM32G431xx/441xx devices, Section 53: STM32G47xxx/48xxx devices. |
| 08-Jul-2019 | 38 | Updated: Table 1: Applicable products, Table 2: Bootloader activation patterns, Table 3: Embedded bootloaders, Table 87: STM32F413xx/423xx configuration in system memory boot mode, Table 135: STM32H74xxx/75xxx configuration in system memory boot mode, Table 136: STM32H74xxx/75xxx bootloader version, Table 144: STM32L031xx/041xx configuration in system memory boot mode, Table 165: STM32L43xxx/44xxx bootloader versions, Table 166: STM32L45xxx/46xxx configuration in system memory boot mode, Table 173: STM32L496xx/4A6xx bootloader version, Table 184: STM32WB30xx/35xx/50xx/55xx bootloader versions, Table 226: Bootloader device-dependent parameters, Table 227: Bootloader startup timings (ms), Table 228: USART bootloader minimum timings (ms), Table 229: USB bootloader minimum timings (ms), Table 230: I2C bootloader minimum timings (ms) Section 3: Glossary, Section 4.1: Bootloader activation, Section 47.1: Bootloader configuration, Section 52.1: Bootloader configuration Figure 77: Bootloader V9.x selection for STM32H74xxx/75xxx, Figure 106: Dual bank boot implementation for STM32L4Rxxx/STM32L4Sxxx bootloader V9.x Added Note: in Section 4.2, Note: in Section 21.3, Note: in Section 60.1, Note: in Section 63.1, Section 47: STM32G03xxx/STM32G04xxx devices |
| 16-Sep-2019 | 39 | Updated: Table 1: Applicable products, Table 2: Bootloader activation patterns, Table 3: Embedded bootloaders, Table 106: STM32G03xxx/04xxx bootloader versions, Table 163: STM32L412xx/422xx bootloader versions, Table 165: STM32L43xxx/44xxx bootloader versions, Table 167: STM32L45xxx/46xxx bootloader versions, Table 169: STM32L47xxx/48xxx bootloader V10.x versions, Table 171: STM32L47xxx/48xxx bootloader V9.x versions, Table 173: STM32L496xx/4A6xx bootloader version, Table 175: STM32L4P5xx/4Q5xx bootloader versions, Table 226: Bootloader device-dependent parameters, Table 227: Bootloader startup timings (ms), Table 228: USART bootloader minimum timings (ms), Table 229: USB bootloader minimum timings (ms), Table 230: I2C bootloader minimum timings (ms) Section 3: Glossary, Section 4.2: Bootloader identification Added Figure 70: Dual bank boot implementation for STM32G47xxx/48xxx bootloader V13.x, Section 79: STM32L552xx/62xx devices, note in Section 81.3: Bootloader version |




| Date | Revision | Changes |
| --- | --- | --- |
| 03-Oct-2019 | 40 | Updated Table 3: Embedded bootloaders, Table 180: STM32L552xx/62xx bootloader versions, Table 184: STM32WB30xx/35xx/50xx/55xx bootloader versions |
| 25-Oct-2019 | 41 | Updated: Table 98: STM32F72xxx/73xxx bootloader V9.x versions, Table 100: STM32F74xxx/75xxx bootloader V7.x versions, Table 102: STM32F74xxx/75xxx bootloader V9.x versions, Table 104: STM32F76xxx/77xxx bootloader V9.x versions, Table 105: STM32G03xxx/G04xxx configuration in system memory boot mode, Table 136: STM32H74xxx/75xxx bootloader version, Table 175: STM32L4P5xx/4Q5xx bootloader versions, Table 178: STM32L552xx/62xx configuration in system memory boot mode, Table 227: Bootloader startup timings (ms), Table 228: USART bootloader minimum timings (ms), Table 230: I2C bootloader minimum timings (ms) Section 24: STM32F2xxxx devices |
| 05-Dec-2019 | 42 | Updated: Table 1: Applicable products, Table 2: Bootloader activation patterns, Table 3: Embedded bootloaders, Table 226: Bootloader device-dependent parameters, Table 227: Bootloader startup timings (ms), Table 228: USART bootloader minimum timings (ms), Table 229: USB bootloader minimum timings (ms), Table 230: I2C bootloader minimum timings (ms) Section 3: Glossary Added: Section 61: STM32H7A3xx/7B3xx/7B0xx devices, Section 77: STM32L4P5xx/4Q5xx devices, Section 89: STM32WLE5xx/55xx devices |



**Table** **232.** **Document** **revision** **history** **(continued)**
| Date | Revision | Changes |
| --- | --- | --- |
| 04-Jun-2020 | 43 | Updated: Table 1: Applicable products, Table 2: Bootloader activation patterns, Table 3: Embedded bootloaders, Table 115: STM32G431xx/441xx configuration in system memory boot mode, Table 117: STM32G47xxx/48xxx configuration in system memory boot mode, Table 118: STM32G47xxx/48xxx bootloader version, Table 136: STM32H74xxx/75xxx bootloader version, Table 138: STM32H7A3xx/7B3xx/7B0xx bootloader version, Table 175: STM32L4P5xx/4Q5xx bootloader versions, Table 178: STM32L552xx/62xx configuration in system memory boot mode, Table 180: STM32L552xx/62xx bootloader versions, Table 183: STM32WB30xx/35xx/50xx/55xx configuration in system memory boot mode, Table 226: Bootloader device-dependent parameters Section 3: Glossary, Section 45: STM32F74xxx/75xxx devices, Section 47.1: Bootloader configuration, Section 48.1: Bootloader configuration, Section 52.1: Bootloader configuration, Section 53.1: Bootloader configuration, Section 60.1: Bootloader configuration Added: Section 4.5: Bootloader UART baudrate detection, Section 4.6: Programming constraints, Section 4.7: ExitSecureMemory feature Note: in: Section 34.1.1: Bootloader configuration, Section 34.2.1: Bootloader configuration, Section 35.1: Bootloader configuration, Section 36.1: Bootloader configuration, Section 38.1: Bootloader configuration, Section 39.1: Bootloader configuration, Section 40.1: Bootloader configuration, Section 41.1.1: Bootloader configuration, Section 41.2.1: Bootloader configurationSection 42.1: Bootloader configuration, Section 43.1: Bootloader configuration, Section 44.1: Bootloader configuration, Section 45.1.1: Bootloader configuration, Section 45.2.1: Bootloader configuration, Section 46.1: Bootloader configuration Figure 94: Dual bank boot Implementation for STM32L3x2xx/44xxx bootloader V9.x, Figure 96: Dual bank boot implementation for STM32L45xxx/46xxx bootloader V9.x, Figure 102: Dual bank boot Implementation for STM32L496xx/4A6xx bootloader V9.x Appendix A: Example of ExitSecureMemory v1.0 function Deleted Figure 48. Access to securable memory area from the bootloader for STM32G03xxx/G04xxx, Figure 50. Access to securable memory area from the bootloader for STM32G07xxx/G08xxx, Figure 52. Access to securable memory area, Figure 54. Access to securable memory area |
| 29-Jul-2020 | 44 | Introduced STM32H72xxx/73xxx devices, hence added Section 59: STM32H72xxx/73xxx devices and its subsections. Updated Section 3: Glossary, note in Section 47.1: Bootloader configuration and Section 81.1: Bootloader configuration. Updated Table 1: Applicable products, Table 2: Bootloader activation patterns, Table 3: Embedded bootloaders, Table 8: ExitSecureMemory entry address, Table 117: STM32G47xxx/48xxx configuration in system memory boot mode, Table 138: STM32H7A3xx/7B3xx/7B0xx bootloader version, Table 156: STM32L1xxxC configuration in system memory boot mode, Table 158: STM32L1xxxD configuration in system memory boot mode, Table 160: STM32L1xxxE configuration in system memory boot mode, Table 178: STM32L552xx/62xx configuration in system memory boot mode, Table 226: Bootloader device-dependent parameters, Table 227: Bootloader startup timings (ms), Table 228: USART bootloader minimum timings (ms), Table 229: USB bootloader minimum timings (ms) and Table 230: I2C bootloader minimum timings (ms). Updated Figure 77: Bootloader V9.x selection for STM32H74xxx/75xxx. Minor text edits across the whole document. |




| Date | Revision | Changes |
| --- | --- | --- |
| 06-Nov-2020 | 45 | Introduced STM32WB30xx, STM32WB35xx, STM32Wl55xx in Table 1: Applicable products, Table 3: Embedded bootloaders and in Section 3: Glossary Updated: Table 81: STM32F410xx configuration in system memory boot mode, Table 87: STM32F413xx/423xx configuration in system memory boot mode, Table 93: STM32F446xx configuration in system memory boot mode, Table 95: STM32F469xx/479xx configuration in system memory boot mode, Table 97: STM32F72xxx/73xxx configuration in system memory boot mode, Table 101: STM32F74xxx/75xxx configuration in system memory boot mode, Table 103: STM32F76xxx/77xxx configuration in system memory boot mode, Table 107: STM32G07xxx/8xxx configuration in system memory boot mode, Table 115: STM32G431xx/441xx configuration in system memory boot mode, Table 116: STM32G431xx/441xx bootloader version, Table 117: STM32G47xxx/48xxx configuration in system memory boot mode, Table 135: STM32H74xxx/75xxx configuration in system memory boot mode, Table 136: STM32H74xxx/75xxx bootloader version, Table 137: STM32H7A3xx/7B3xx/7B0xx configuration in system memory boot mode, Table 138: STM32H7A3xx/7B3xx/7B0xx bootloader version, Table 142: STM32L01xxx/02xxx configuration in system memory boot mode, Table 144: STM32L031xx/041xx configuration in system memory boot mode, Table 149: STM32L07xxx/08xxx bootloader versions, Table 150: STM32L07xxx/08xxx configuration in system memory boot mode, Table 162: STM32L412xx/422xx configuration in system memory boot mode, Table 174: STM32L4P5xx/4Q5xx configuration in system memory boot mode, Table 176: STM32L4Rxxx/4Sxxx configuration in system memory boot mode, Table 178: STM32L552xx/62xx configuration in system memory boot mode, Table 183: STM32WB30xx/35xx/50xx/55xx configuration in system memory boot mode, Table 202: STM32WLE5xx/55xx configuration in system memory boot mode, Table 203: STM32WLE5xx/55xx bootloader versions, Table 226: Bootloader device-dependent parameters, Table 227: Bootloader startup timings (ms), Table 228: USART bootloader minimum timings (ms) title of Table 81: STM32WB30xx/35xx/50xx/55xx devices, Table 183: STM32WB30xx/35xx/50xx/55xx configuration in system memory boot mode, Table 89: STM32WLE5xx/55xx devices, Table 202: STM32WLE5xx/55xx configuration in system memory boot mode, Table 118: Bootloader V12.x selection for STM32WLE5xx/55xx, Table 203: STM32WLE5xx/55xx bootloader versions |
| 02-Dec-2020 | 46 | Upadated: Table 3: Embedded bootloaders, Table 105: STM32G03xxx/G04xxx configuration in system memory boot mode, Table 117: STM32G47xxx/48xxx configuration in system memory boot mode, Table 165: STM32L43xxx/44xxx bootloader versions, Table 167: STM32L45xxx/46xxx bootloader versions Added following notes: Note: on page 379, Note: on page 386, Note: on page 394, Note: on page 407, Note: on page 413 |



**Table** **232.** **Document** **revision** **history** **(continued)**
| Date | Revision | Changes |
| --- | --- | --- |
| 16-Feb-2021 | 47 | Updated: Table 1: Applicable products, Table 3: Embedded bootloaders, Table 8: ExitSecureMemory entry address, Table 104: STM32F76xxx/77xxx bootloader V9.x versions, Table 117: STM32G47xxx/48xxx configuration in system memory boot mode, Table 162: STM32L412xx/422xx configuration in system memory boot mode, Table 164: STM32L43xxx/44xxx configuration in system memory boot mode, Table 166: STM32L45xxx/46xxx configuration in system memory boot mode, Table 170: STM32L47xxx/48xxx configuration in system memory boot mode, Table 172: STM32L496xx/4A6xx configuration in system memory boot mode, Table 174: STM32L4P5xx/4Q5xx configuration in system memory boot mode, Table 176: STM32L4Rxxx/4Sxxx configuration in system memory boot mode, Table 178: STM32L552xx/62xx configuration in system memory boot mode, Table 183: STM32WB30xx/35xx/50xx/55xx configuration in system memory boot mode, Table 226: Bootloader device-dependent parameters, Table 227: Bootloader startup timings (ms), Table 228: USART bootloader minimum timings (ms), Table 229: USB bootloader minimum timings (ms), Table 230: I2C bootloader minimum timings (ms) Section 3: Glossary Added Section 49: STM32G0B0xx device bootloader and Section 50: STM32G0B1xx/0C1xx device bootloader |
| 01-Apr-2021 | 48 | Updated: – Table 1: Applicable products, Table 3: Embedded bootloaders, Table 8: ExitSecureMemory entry address, Table 226: Bootloader device-dependent parameters, Table 227: Bootloader startup timings (ms), Table 228: USART bootloader minimum timings (ms), Table 230: I2C bootloader minimum timings (ms) Added Section 51: STM32G05xxx/061xx devices and Section 54: STM32G491xx/4A1xx devices |
| 06-Jul-2021 | 49 | Updated: Section 3: Glossary, Section 34.2.1: Bootloader configuration Table 3, Table 29,from Table 31 to Table 36, from Table 39 to Table 44, Table 45, Table 47, Table 49, Table 53, Table 55, Table 57, Table 59, Table 61, Table 63, Table 65, Table 67, Table 69, Table 71, Table 73, Table 75, Table 76, Table 77, Table 79, Table 81, Table 83, Table 85, Table 87, Table 89, Table 91, Table 93, Table 95, Table 97, Table 99, Table 101, Table 103, Table 105, Table 107, Table 109, Table 111, Table 113, Table 115, Table 117, Table 118, Table 119, Table 133, Table 135, Table 137, Table 137, Table 142, Table 144, Table 146, Table 147, Table 148, Table 150, Table 152, Table 154, Table 155, Table 156, Table 157, Table 158, Table 160, Table 161, Table 162, Table 164, Table 166, Table 168, Table 170, Table 172, Table 174, Table 176, Table 178, Table 183, Table 202, Table 226 Added Table 179: STM32L552xx/62xx special commands and Section 80: STM32WB10xx/15xx devices |
| 23-Sep-2021 | 50 | Updated: Section 3: Glossary, Section 49.1: Bootloader configuration, Section 50.1: Bootloader configuration, Table 1, Table 2, Table 3, Table 108, Table 134, Table 136, Table 138, Table 165, Table 182, Table 184, Table 226, Table 227, Table 228, Table 229, Table 230 Added Section 95: STM32U575xx/85xx devices |




| Date | Revision | Changes |
| --- | --- | --- |
| 20-Oct-2021 | 51 | Updated: Table 3, Table 76,Table 108, Table 134,Table 226 Section 34.2.1: Bootloader configuration |
| 04-Feb-2022 | 52 | Updated: Section 3: Glossary, Section 4.1: Bootloader activation, Table 1, Table 2, Table 3, Table 7, Table 108, Table 136, Table 226 Figure 65 Added Section 5: STM32C011xx devices and Section 6: STM32C031xx devices |
| 01-Mar-2022 | 53 | Updated: Table 3, Table 133, Table 134, Table 226. Section 4.1: Bootloader activation, , Section 47.1: Bootloader configuration, Section 48.1: Bootloader configuration, Section 49.1: Bootloader configuration, Section 51.1: Bootloader configuration |
| 20-Apr-2022 | 54 | Updated: – Table 3, Table 133, Table 137, Table 138, Table 226 |
| 22-Jun-2022 | 55 | Updated: – Table 3, Table 135, Table 134, Table 226 |
| 14-Dec-2022 | 56 | Added Section 4.8: IWDG usage, Section 78: STM32WBA52xx devices Updated: Table 1, Table 2, Table 3, Table 7, Table 136, Table 137, Table 203, Table 226, Table 227, Table 228, Table 230 Section 3: Glossary, Section 4.1: Bootloader activation added note 1 in Table 107, Table 109, Table 111, Table 115, Table 117, Table 119, Table 162 |
| 21-Feb-2023 | 57 | Updated: Table 1: Applicable products, Table 2: Bootloader activation patterns, Table 3: Embedded bootloaders, Table 7: Flash memory alignment constraints, Table 226: Bootloader device-dependent parameters, Table 227: Bootloader startup timings (ms), Table 228: USART bootloader minimum timings (ms), Table 229: USB bootloader minimum timings (ms), Table 230: I2C bootloader minimum timings (ms) Section 3: Glossary, Section 4.2: Bootloader identification Added Section 55: STM32H503xx devices, Section 57: STM32H562xx/563xx/573xx devices, Section 96: STM32U595xx/99xx/A5xx/A9xx devices |
| 04-Apr-2023 | 58 | Updated: Table 1: Applicable products, Table 3: Embedded bootloaders, Table 226: Bootloader device-dependent parameters, Table 227: Bootloader startup timings (ms), Table 228: USART bootloader minimum timings (ms), Table 229: USB bootloader minimum timings (ms), Table 230: I2C bootloader minimum timings (ms) Section 3: Glossary Added Section 94: STM32U535xx/545xx devices |
| 21-Jun-2023 | 59 | Updated Table 3: Embedded bootloaders, Table 108: STM32G07xxx/08xxx bootloader versions, and Table 226: Bootloader device-dependent parameters. Minor text edits across the whole document. |



**Table** **232.** **Document** **revision** **history** **(continued)**
| Date | Revision | Changes |
| --- | --- | --- |
| 25-Oct-2023 | 60 | Updated Section 2: Related documents, note in Section 4.1: Bootloader activation, Section 57.3: Bootloader version, and Section 72.1: Bootloader configuration. Updated Table 2: Bootloader activation patterns, Table 3: Embedded bootloaders, Table 78: STM32F401xB(C) bootloader versions, Table 111: STM32G0B1xx/0C1xx configuration in system memory boot mode, Table 121: STM32H503xx configuration in system memory boot mode, Table 127: STM32H562xx/563xx/573xx configuration in system memory boot mode, Table 129: STM32H562xx/563xx/573xx bootloader version, Table 133: STM32H72xxx/73xxx configuration in system memory boot mode, Table 135: STM32H74xxx/75xxx configuration in system memory boot mode, Table 137: STM32H7A3xx/7B3xx/7B0xx configuration in system memory boot mode, Table 178: STM32L552xx/62xx configuration in system memory boot mode, Table 180: STM32L552xx/62xx bootloader versions, Table 214: STM32U535xx/545xx configuration in system memory boot mode, Table 214: STM32U535xx/545xx configuration in system memory boot mode, Table 216: STM32U535xx/545xx bootloader versions, Table 219: STM32U575xx/85xx bootloader versions, Table 220: STM32U595xx/99xx/A5xx/A9xx configuration in system memory boot mode, Table 222: STM32U595xx/99xx/A5xx/A9xx bootloader versions, and Table 227: Bootloader startup timings (ms). Updated Figure 72: Bootloader V14 selection for STM32H503xx, Figure 74: Bootloader V14 selection for STM32H562xx/563xx/573xx, Figure 123: Bootloader V9.x selection for STM32U535xx/545xx, Figure 124: Bootloader V9.x selection for STM32U575xx/85xx, and Figure 125: Bootloader V9.x selection for STM32U595xx/99xx/A5xx/A9xx. Minor text edits across the whole document. |
| 11-Jan-2024 | 61 | Added STM32U5F7xx, STM32U5F9xx, STM32U5G7xx, and STM32U5G9xx devices. Updated Table 1: Applicable products, Table 3: Embedded bootloaders, and tables 226 to 230. Updated Section 3: Glossary. Added Section 97: STM32U5F7xx/F9xx/G7xx/G9xx devices and its subsections. Minor text edits across the whole document. |




| Date | Revision | Changes |
| --- | --- | --- |
| 06-Mar-2024 | 62 | Updated Table 1: Applicable products, Table 3: Embedded bootloaders, Table 7: Flash memory alignment constraints, Table 8: ExitSecureMemory entry address, Table 45: STM32F10xxx configuration in system memory boot mode, Table 111: STM32G0B1xx/0C1xx configuration in system memory boot mode, Table 121: STM32H503xx configuration in system memory boot mode, Table 123: STM32H503xx bootloader version, Table 127: STM32H562xx/563xx/573xx configuration in system memory boot mode, Table 133: STM32H72xxx/73xxx configuration in system memory boot mode, Table 135: STM32H74xxx/75xxx configuration in system memory boot mode, Table 136: STM32H74xxx/75xxx bootloader version, Table 137: STM32H7A3xx/7B3xx/7B0xx configuration in system memory boot mode, Table 170: STM32L47xxx/48xxx configuration in system memory boot mode, and Table 226: Bootloader device-dependent parameters. Updated Section 3: Glossary, Section 4.1: Bootloader activation, Section 73.1: Bootloader configuration, and Section 74.1: Bootloader configuration. Added Section 4.7.1: ExitSecureMemory v1.0, Section 4.7.2: ExitSecureMemory v1.1, Section 56: STM32H523xx/533xx devices, Section 62: STM32H7Rxxx/7Sxxx devices, Section 82: STM32WBA5xxx devices, Section 90: STM32U031xx devices, Section 91: STM32U073xx/83xx devices, and their subsections. Added Appendix B: Example of ExitSecureMemory v1.1 function. Updated Figure 6: ExitSecureMemory function usage, Figure 7: Access to securable memory area from the bootloader, Figure 72: Bootloader V14 selection for STM32H503xx, and Figure 74: Bootloader V14 selection for STM32H562xx/563xx/573xx. Minor text edits across the whole document. |
| 13-May-2024 | 63 | Added STM32H562xx devices and STM32WB0 series, hence updated Table 1: Applicable products, Table 3: Embedded bootloaders, Table 7: Flash memory alignment constraints, and tables 227 to 231. Updated Section 3: Glossary and note in Section 73.1: Bootloader configuration. Added Section 85: STM32WB05xx devices, Section 86: STM32WB06xx/07xx devices, Section 87: STM32WB09xx devices, and their subsections. Updated Figure 55: Bootloader V9.x selection for STM32F446xx and Figure 111: Bootloader V11.x selection for STM32WBA5xxx. Updated Table 2: Bootloader activation patterns, Table 112: STM32G0B1xx/0C1xx bootloader versions, Table 133: STM32H72xxx/73xxx configuration in system memory boot mode, Table 135: STM32H74xxx/75xxx configuration in system memory boot mode, Table 214: STM32U535xx/545xx configuration in system memory boot mode, and Table 217: STM32U575xx/85xx configuration in system memory boot mode. Minor text edits across the whole document. |



**Table** **232.** **Document** **revision** **history** **(continued)**
| Date | Revision | Changes |
| --- | --- | --- |
| 18-Sep-2024 | 64 | Added STM32C071xx and STM32H7B0xx devices, hence updated Table 1: Applicable products, Table 3: Embedded bootloaders, and tables 226 to 231. Updated Section 3: Glossary, Section 4.2: Bootloader identification, Section 55.1: Bootloader configuration, Section 56.1: Bootloader configuration, Section 57.1: Bootloader configuration, Section 61: STM32H7A3xx/7B3xx/7B0xx devices, Section 79.1: Bootloader configuration, Section 78.1: Bootloader configuration, Section 82.1: Bootloader configuration, Section 94.1: Bootloader configuration, Section 95.1: Bootloader configuration, and Section 96.1: Bootloader configuration. Added Section 4.9: Bootloader models, Section 4.10: Boot constraints on BL, Section 7: STM32C051xx devices, and Section 48.3.1: Compatibility break on boot sequence. Updated Table 8: ExitSecureMemory entry address, Table 108: STM32G07xxx/08xxx bootloader versions, Table 169: STM32L47xxx/48xxx bootloader V10.x versions, and Table 170: STM32L47xxx/48xxx configuration in system memory boot mode. |
| 14-Feb-2025 | 65 | Added STM32C051/91/92xx, STM32U375/385xx, and STM32WBA62/63/64/65xx devices. Updated Table 1: Applicable products, Table 3: Embedded bootloaders, tables 6 to 10, Table 14: STM32C051xx configuration in system memory boot mode, Table 110: STM32G0B0xx bootloader versions, Table 112: STM32G0B1xx/0C1xx bootloader versions, Table 114: STM32G05xxx/061xx bootloader versions, Table 116: STM32G431xx/441xx bootloader version, Table 124: STM32H523xx/533xx configuration in system memory boot mode, Table 127: STM32H562xx/563xx/573xx configuration in system memory boot mode, Table 136: STM32H74xxx/75xxx bootloader version, Table 139: STM32H7Rxxx/7Sxxx configuration in system memory boot mode, Table 171: STM32L47xxx/48xxx bootloader V9.x versions, Table 185: STM32WBA5xxx configuration in system memory boot mode, tables 204 to 208, Table 220: STM32U595xx/99xx/A5xx/A9xx configuration in system memory boot mode, and tables 226 to 231. Added footnote to Table 109: STM32G0B0xx configuration in system memory boot mode. Updated Section 3: Glossary, Section 4.2: Bootloader identification, Section 4.3: Hardware connection requirements, Section 90.1: Bootloader configuration, and Section 91.1: Bootloader configuration. Replaced master/slave with controller target when referring to I2C. Added Section 7: STM32C051xx devices, Section 9: STM32C091xx/92xx devices, Section 62.4: Jump to bootloader, Section 84: STM32WBA62xx/63xx/64xx/65xx devices, Section 92: STM32U375xx/85xx devices, and their subsections. Updated Figure 4: SPI connection, figures 13 to 15, 63 to 69, 71 to 74, 78 and 79, Figure 111: Bootloader V11.x selection for STM32WBA5xxx,and figures 118 to 120. Minor text edits across the whole document. |
| 10-Apr-2025 | 66 | Updated Table 3: Embedded bootloaders, Table 108: STM32G07xxx/08xxx bootloader versions, Table 136: STM32H74xxx/75xxx bootloader version, and Table 226: Bootloader device-dependent parameters. |




| Date | Revision | Changes |
| --- | --- | --- |
| 01-Jul-2025 | 67 | Updated document title. Added STM32WBA50xx and STM32WL3xxx devices. Updated Table 1: Applicable products, Table 2: Bootloader activation patterns, Table 3: Embedded bootloaders, Table 7: Flash memory alignment constraints, Table 17: STM32C071xx bootloader versions, Table 106: STM32G03xxx/04xxx bootloader versions, Table 116: STM32G431xx/441xx bootloader version, Table 185: STM32WBA5xxx configuration in system memory boot mode, Table 187: STM32WBA5xxx bootloader versions, Table 226: Bootloader device-dependent parameters, and Table 227: Bootloader startup timings (ms). Updated Section 3: Glossary, Section 4.1: Bootloader activation, Section 4.3: Hardware connection requirements, note in Section 16.1: Bootloader configuration, Section 82: STM32WBA5xxx devices, and Section 99.1: Bootloader startup timing. Removed former Section 78: STM32WBA52xx devices. Added Section 88: STM32WL3xxx devices and its subsections. |
| 04-Aug-2025 | 68 | Updated Table 12: STM32C031xx configuration in system memory boot mode, Table 16: STM32C071xx configuration in system memory boot mode, Table 36: STM32F04xxx bootloader versions, Table 38: STM32F070x6 bootloader versions, Table 40: STM32F070xB bootloader versions, Table 42: STM32F071xx/072xx bootloader versions, Table 56: STM32F301xx/302x4(6/8) bootloader versions, Table 58: STM32F302xB(C)/303xB(C) bootloader versions, Table 60: STM32F302xD(E)/303xD(E) bootloader versions, Table 68: STM32F373xx bootloader versions, Table 149: STM32L07xxx/08xxx bootloader versions, Table 157: STM32L1xxxC bootloader versions, Table 159: STM32L1xxxD bootloader versions, and Table 161: STM32L1xxxE bootloader versions. |
| 18-Nov-2025 | 69 | Updated Table 3: Embedded bootloaders, Table 18: STM32C091xx/92xx configuration in system memory boot mode, Table 113: STM32G05xxx/061xx configuration in system memory boot mode, Table 141: STM32H7Rxxx/7Sxxx bootloader version, and Table 219: STM32U575xx/85xx bootloader versions. Updated Figure 15: Bootloader V11.0 selection for STM32C051xx devices. Minor text edits across the whole document. |
| 23-Feb-2026 | 70 | Updated the entire document to add STM32C5xx, STM32H5Ex/5Fx, STM32U3B5xx/3C5xx, and STM32WBA2xxx devices. |

































**IMPORTANT** **NOTICE** **–** **READ** **CAREFULLY**


STMicroelectronics NV and its subsidiaries (“ST”) reserve the right to make changes, corrections, enhancements, modifications, and improvements to ST products and/or to this document at any time without notice.


In the event of any conflict between the provisions of this document and the provisions of any contractual arrangement in force between the purchasers and ST, the provisions of such contractual arrangement shall prevail.


The purchasers should obtain the latest relevant information on ST products before placing orders. ST products are sold pursuant to ST’s terms and conditions of sale in place at the time of order acknowledgment.


The purchasers are solely responsible for the choice, selection, and use of ST products and ST assumes no liability for application assistance or the design of the purchasers’ products.


No license, express or implied, to any intellectual property right is granted by ST herein.


Resale of ST products with provisions different from the information set forth herein shall void any warranty granted by ST for such product.


If the purchasers identify an ST product that meets their functional and performance requirements but that is not designated for the purchasers market segment, the purchasers shall contact ST for more information.


ST and the ST logo are trademarks of ST. For additional information about ST trademarks, refer to [www.st.com/trademarks.](http://www.st.com/trademarks) All other product or service names are the property of their respective owners.


Information in this document supersedes and replaces information previously supplied in any prior versions of this document.


© 2026 STMicroelectronics – All rights reserved