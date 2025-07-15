
import dotenv from 'dotenv';
dotenv.config();
import { Sequelize } from 'sequelize';
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
  }
);

export function getSequelizeInstance() {
  return new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'mysql',
      logging: false,
    }
  );
}
// 모델 정의
const Test = sequelize.define('Test', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  folder: {
    type: Sequelize.STRING,
    allowNull: true
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  category: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  thumbnail: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  views: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  likes: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
});

const Comment = sequelize.define('Comment', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  testId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  nickname: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  content: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  likes: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
});

const Like = sequelize.define('Like', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  testId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  commentId: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  ip: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
});

const Visitor = sequelize.define('Visitor', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  testId: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  ip: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  country: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  region: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  userAgent: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  page: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  duration: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  visitedAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
});

const LottoDraw = sequelize.define('LottoDraw', {
  drawNo: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  numbers: {
    type: Sequelize.STRING, // 예: '1,2,3,4,5,6'
    allowNull: false,
  },
  bonus: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  drawDate: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
});

// 관계 정의
Test.hasMany(Comment, { foreignKey: 'testId' });
Comment.belongsTo(Test, { foreignKey: 'testId' });

Test.hasMany(Like, { foreignKey: 'testId' });
Like.belongsTo(Test, { foreignKey: 'testId' });

Comment.hasMany(Like, { foreignKey: 'commentId' });
Like.belongsTo(Comment, { foreignKey: 'commentId' });

Test.hasMany(Visitor, { foreignKey: 'testId' });
Visitor.belongsTo(Test, { foreignKey: 'testId' });

// 서버 시작 시 DB 테이블 자동 생성/동기화
sequelize.sync();

export { Test, Comment, Like, Visitor, LottoDraw };
export default sequelize;

// region 일괄 업데이트 함수 (updateRegion.js 내용 이식)
export async function updateAllVisitorRegion() {
  const fs = (await import('fs')).default;
  const path = (await import('path')).default;
  let REGION_MAP = {};
  try {
    REGION_MAP = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/utils/region-map.json'), 'utf8'));
  } catch (e) {
    console.error('region-map.json 파일을 불러올 수 없습니다.', e);
    return;
  }
  let regionNames = {};
  try {
    regionNames = require('geoip-lite/regions.json');
  } catch (e) {
    regionNames = {};
  }
  try {
    const visitors = await Visitor.findAll({ where: { region: null } });
    let updated = 0;
    for (const v of visitors) {
      if (!v.country) continue;
      const country = v.country;
      let regionCode = v.getDataValue('region');
      if (!regionCode && v.dataValues.region === null && v.dataValues.country) continue;
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
  }
}

// 환경변수 UPDATE_REGION이 true일 때만 region 업데이트 실행
if (process.env.UPDATE_REGION === 'true') {
  updateAllVisitorRegion().then(() => process.exit(0));
} 