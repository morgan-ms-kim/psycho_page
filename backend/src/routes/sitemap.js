import express from 'express';
import { Test } from '../models/index.js';

const router = express.Router();

router.get('/sitemap.xml', async (req, res) => {
  const baseUrl = "https://smartpick.website";
  try {
    // DB에서 모든 테스트 id 조회
    const tests = await Test.findAll({ attributes: ['id'] });
    const testIds = tests.map(t => t.id);

    let urls = [
      "",
      "/history",
      ...testIds.map(id => `/testview/${id}`),
      ...testIds.map(id => `/tests/${id}/`)
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(path => `
  <url>
    <loc>${baseUrl}${path}</loc>
  </url>
`).join("")}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (e) {
    res.status(500).send('사이트맵 생성 오류');
  }
});

export default router; 