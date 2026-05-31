const fs = require('fs');

let content = fs.readFileSync('server/routes.ts', 'utf8');

// There's an unclosed try block in DPR:
// 1624: try {
// 1633: try {

content = content.replace(
`    app.post("/api/projects/:projectId/dprs", authenticateToken, async (req: any, res) => {
    try {
      const { projectId } = req.params;`,
`    app.post("/api/projects/:projectId/dprs", authenticateToken, async (req: any, res) => {
      const { projectId } = req.params;`
);

fs.writeFileSync('server/routes.ts', content);
