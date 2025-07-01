import express from 'express';
import { Test } from '../models/index.js';

const router = express.Router();

router.get('/sitemap.xml', async (req, res) => {
  const baseUrl = "https://smartpick.website";
  try {
    const tests = await Test.findAll({ attributes: ['id'] });
    // id 중복 제거
    const testIds = [...new Set(tests.map(t => t.id))];

    let urls = [
      "",
      "/history",
      ...testIds.map(id => `/testview/${id}`)
    ];

    // URL 중복 제거
    const uniqueUrls = [...new Set(urls)];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueUrls.map(path => `
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