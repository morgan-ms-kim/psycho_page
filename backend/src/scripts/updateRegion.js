// Visitor region 일괄 업데이트 스크립트
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
console.log('DB_USER:', process.env.DB_USER); // 값이 제대로 찍히는지 확인

import sequelize, { Visitor } from '../models/index.js';
// region-map.json 불러오기
let REGION_MAP = {};
try {
  REGION_MAP = JSON.parse(fs.readFileSync(path.join(__dirname, '../utils/region-map.json'), 'utf8'));
} catch (e) {
  console.error('region-map.json 파일을 불러올 수 없습니다.', e);
  process.exit(1);
}
// geoip-lite/regions.json (한국 fallback)
let regionNames = {};
try {
  regionNames = require('geoip-lite/regions.json');
} catch (e) {
  regionNames = {};
}

async function updateRegions() {
  try {
    // region이 null이거나 빈 값인 방문자만
    const visitors = await Visitor.findAll({
      where: {
        region: null
      },
    });
    let updated = 0;
    for (const v of visitors) {
      const country = v.country;
      let regionCode = v.getDataValue('region'); // region 필드가 코드로 저장된 경우
      if (!regionCode && v.dataValues.region === null && v.dataValues.country) {
        // region이 null이고 country가 있으면 geoip로 regionCode 추정 불가, skip
        continue;
      }
      // regionCode가 있다면 매핑 시도
      let regionName = null;
      if (country && regionCode && REGION_MAP[country] && REGION_MAP[country][regionCode]) {
        regionName = REGION_MAP[country][regionCode];
      } else if (country === 'KR' && regionCode && regionNames['KR'] && regionNames['KR'][regionCode]) {
        regionName = regionNames['KR'][regionCode];
      }
      if (regionName) {
        v.region = regionName;
        await v.save();
        updated++;
      }
    }
    console.log(`업데이트 완료: ${updated}개 방문자 region 필드가 갱신되었습니다.`);
  } catch (err) {
    console.error('업데이트 중 오류:', err);
  } finally {
    await sequelize.close();
  }
}

updateRegions(); 