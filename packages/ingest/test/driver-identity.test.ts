import { deepStrictEqual, ok, strictEqual } from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import {
  compatibleIndex,
  drvCompatTokens,
  integerDefines,
  readDriverIdentity,
} from '../src/parsers/driver-identity.ts';

const ZEPHYR = process.env.ZEPHYR_BASE ?? join(process.cwd(), '..', '..', '.cache', 'zephyr');
const haveTree = existsSync(join(ZEPHYR, 'drivers'));
if (process.env.ZEPHYR_AI_RELEASE_TEST === '1' && !haveTree) {
  throw new Error('Release tests require the pinned Zephyr tree; run npm run fetch:zephyr.');
}

/** The mpu6050 shape: one register read, four accepted values across two branches. */
const MPU_HEADER = `
#define MPU6050_REG_CHIP_ID		0x75
#define MPU6050_CHIP_ID			0x68
#define MPU6500_CHIP_ID			0x70
#define MPU9250_CHIP_ID			0x71
#define MPU6880_CHIP_ID			0x19
`;
const MPU_SOURCE = `
#define DT_DRV_COMPAT invensense_mpu6050
#include "mpu6050.h"

static int mpu6050_init(const struct device *dev)
{
	uint8_t id;

	/* check chip ID */
	if (i2c_reg_read_byte_dt(&cfg->i2c, MPU6050_REG_CHIP_ID, &id) < 0) {
		return -EIO;
	}

	if (id == MPU6050_CHIP_ID || id == MPU9250_CHIP_ID || id == MPU6880_CHIP_ID) {
		drv_data->device_type = DEVICE_TYPE_MPU6050;
	} else if (id == MPU6500_CHIP_ID) {
		drv_data->device_type = DEVICE_TYPE_MPU6500;
	} else {
		return -EINVAL;
	}
	return 0;
}
`;

describe('integerDefines', () => {
  it('reads object-like macros with an integer value', () => {
    const defines = integerDefines('#define A 0x19\n#define B 25\n#define C 0b101\n');
    strictEqual(defines.get('A'), 0x19);
    strictEqual(defines.get('B'), 25);
    strictEqual(defines.get('C'), 5);
  });

  it('skips anything that needs a preprocessor to evaluate', () => {
    // A value this cannot read is a value it must not report. An expression that
    // looks arithmetic is still a guess about macro expansion order.
    const defines = integerDefines('#define A (B + 1)\n#define F(x) ((x) << 1)\n#define S "text"\n');
    strictEqual(defines.size, 0);
  });
});

describe('drvCompatTokens', () => {
  it('finds the token wherever upstream declares it', () => {
    // Many drivers define DT_DRV_COMPAT in the header rather than the .c, and
    // reading only the .c missed a third of the corpus.
    deepStrictEqual(drvCompatTokens(['#define DT_DRV_COMPAT bosch_bme280\n']), ['bosch_bme280']);
    deepStrictEqual(drvCompatTokens(['/* nothing */', '#define DT_DRV_COMPAT st_lis2dh\n']), ['st_lis2dh']);
  });
});

describe('readDriverIdentity', () => {
  it('reads the register and every accepted value', () => {
    const result = readDriverIdentity([MPU_SOURCE, MPU_HEADER]);
    ok(typeof result !== 'string', 'expected a contract');
    deepStrictEqual(result.compatTokens, ['invensense_mpu6050']);
    strictEqual(result.registerName, 'MPU6050_REG_CHIP_ID');
    strictEqual(result.register, 0x75);
    // 0x19 is the MPU6880: a part whose name appears in no binding, no board
    // file and no documentation page, and the question that produced this table.
    deepStrictEqual(
      result.values.map((value) => value.value),
      [0x19, 0x68, 0x70, 0x71],
    );
  });

  it('treats a lone inequality as the accepted value', () => {
    const result = readDriverIdentity([
      '#define DT_DRV_COMPAT st_lis2dh\n' +
        'int init(void) {\n' +
        '  hw->read_reg(dev, LIS2DH_REG_WAI, &id);\n' +
        '  if (id != LIS2DH_CHIP_ID) { return -EINVAL; }\n' +
        '}\n',
      '#define LIS2DH_REG_WAI 0x0f\n#define LIS2DH_CHIP_ID 0x33\n',
    ]);
    ok(typeof result !== 'string');
    deepStrictEqual(result.values, [{ name: 'LIS2DH_CHIP_ID', value: 0x33 }]);
    strictEqual(result.register, 0x0f);
  });

  it('refuses a multi-byte signature rather than reading it as alternatives', () => {
    // hmc5883l compares id[0], id[1] and id[2] against three constants. All
    // three must match; reading them as three accepted values would say a part
    // is supported when the driver refuses it.
    const result = readDriverIdentity([
      '#define DT_DRV_COMPAT honeywell_hmc5883l\n' +
        'i2c_burst_read_dt(&config->i2c, HMC5883L_REG_CHIP_ID, id, 3);\n' +
        'if (id[0] != HMC5883L_CHIP_ID_A || id[1] != HMC5883L_CHIP_ID_B) { return -EINVAL; }\n',
      '#define HMC5883L_REG_CHIP_ID 0x0a\n#define HMC5883L_CHIP_ID_A 0x48\n#define HMC5883L_CHIP_ID_B 0x34\n',
    ]);
    strictEqual(result, 'several-compared-lvalues');
  });

  it('says nothing about a driver with no identity check', () => {
    strictEqual(
      readDriverIdentity(['#define DT_DRV_COMPAT st_stm32_spi\nstatic int init(void) { return 0; }\n']),
      'no-identity-comparison',
    );
  });

  it('reaches the same field through different locals', () => {
    // bme280 writes data->chip_id in one function and dev_data->chip_id in
    // another. They are one field, and treating them as two lvalues rejected a
    // driver whose contract is unambiguous.
    const result = readDriverIdentity([
      '#define DT_DRV_COMPAT bosch_bme280\n' +
        'bme280_reg_read(dev, BME280_REG_ID, &data->chip_id, 1);\n' +
        'if (data->chip_id == BME280_CHIP_ID) { }\n' +
        'else if (dev_data->chip_id == BMP280_CHIP_ID_MP) { }\n',
      '#define BME280_REG_ID 0xD0\n#define BME280_CHIP_ID 0x60\n#define BMP280_CHIP_ID_MP 0x58\n',
    ]);
    ok(typeof result !== 'string');
    deepStrictEqual(
      result.values.map((value) => value.name),
      ['BMP280_CHIP_ID_MP', 'BME280_CHIP_ID'],
    );
  });
});

describe('compatibleIndex', () => {
  it('resolves a DT_DRV_COMPAT token through the binding catalogue', () => {
    // The token is the compatible with every non-alphanumeric replaced, which is
    // not reversible: `_` may have been `,`, `-` or `.`.
    const index = compatibleIndex(['invensense,mpu6050', 'st,stm32-digi-temp']);
    strictEqual(index.get('invensense_mpu6050'), 'invensense,mpu6050');
    strictEqual(index.get('st_stm32_digi_temp'), 'st,stm32-digi-temp');
  });

  it('drops both sides of a collision instead of picking one', () => {
    const index = compatibleIndex(['vendor,a-b', 'vendor,a_b']);
    strictEqual(index.get('vendor_a_b'), '');
  });

  it('is not confused by one compatible arriving once per bus binding', () => {
    // A device reachable over more than one bus has one binding per bus, so the
    // catalogue lists the compatible twice. Reading that as a collision dropped
    // every multi-bus sensor, including lis2dh, bme280 and adxl345.
    strictEqual(compatibleIndex(['st,lis2dh', 'st,lis2dh']).get('st_lis2dh'), 'st,lis2dh');
  });
});

describe('driver identity against the pinned tree', () => {
  it('extracts the mpu6050 contract from the real driver', { skip: !haveTree }, () => {
    const directory = join(ZEPHYR, 'drivers', 'sensor', 'tdk', 'mpu6050');
    const sources = ['mpu6050.c', ...readdirSync(directory).filter((name) => name.endsWith('.h'))].map(
      (name) => readFileSync(join(directory, name), 'utf8'),
    );
    const result = readDriverIdentity(sources);
    ok(typeof result !== 'string', 'expected a contract from the real driver');
    strictEqual(result.register, 0x75);
    ok(
      result.values.some((value) => value.value === 0x19 && value.name === 'MPU6880_CHIP_ID'),
      'the MPU6880 identity must be among the accepted values',
    );
  });
});
