const SampleSlides = {
    templates: [
        {
            name: 'Business Pitch',
            description: 'Professional pitch deck template',
            slideSize: { width: 1280, height: 720, name: 'PowerPoint 16:9' },
            slides: [
                {
                    id: 'sample_1',
                    type: 'html',
                    source: 'Title Slide',
                    content: `<!DOCTYPE html>
<html><head><style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); height: 100vh; display: flex; align-items: center; justify-content: center; color: white; }
.container { text-align: center; padding: 40px; }
h1 { font-size: 72px; font-weight: 700; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.2); }
p { font-size: 28px; opacity: 0.9; }
.line { width: 100px; height: 4px; background: white; margin: 30px auto; border-radius: 2px; }
</style></head><body>
<div class="container">
<h1>Your Company Name</h1>
<div class="line"></div>
<p>Transforming Ideas into Reality</p>
</div>
</body></html>`
                },
                {
                    id: 'sample_2',
                    type: 'html',
                    source: 'Problem Slide',
                    content: `<!DOCTYPE html>
<html><head><style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', sans-serif; background: #1a1a2e; height: 100vh; padding: 60px; color: white; }
h2 { font-size: 48px; color: #ff6b6b; margin-bottom: 50px; }
.problems { display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; }
.problem { background: rgba(255,255,255,0.05); padding: 30px; border-radius: 16px; border-left: 4px solid #ff6b6b; }
.problem h3 { font-size: 24px; margin-bottom: 10px; }
.problem p { opacity: 0.7; font-size: 18px; }
</style></head><body>
<h2>The Problem</h2>
<div class="problems">
<div class="problem"><h3>Challenge 1</h3><p>Description of the first major problem your solution addresses.</p></div>
<div class="problem"><h3>Challenge 2</h3><p>Description of the second challenge in the market.</p></div>
<div class="problem"><h3>Challenge 3</h3><p>Another pain point your customers face daily.</p></div>
<div class="problem"><h3>Challenge 4</h3><p>The final key problem that needs solving.</p></div>
</div>
</body></html>`
                },
                {
                    id: 'sample_3',
                    type: 'html',
                    source: 'Solution Slide',
                    content: `<!DOCTYPE html>
<html><head><style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(180deg, #0f0f23 0%, #1a1a3e 100%); height: 100vh; padding: 60px; color: white; display: flex; flex-direction: column; }
h2 { font-size: 48px; color: #4ade80; margin-bottom: 40px; }
.content { flex: 1; display: flex; align-items: center; gap: 60px; }
.text { flex: 1; }
.text p { font-size: 22px; line-height: 1.8; opacity: 0.9; }
.visual { flex: 1; display: flex; align-items: center; justify-content: center; }
.circle { width: 300px; height: 300px; background: linear-gradient(135deg, #4ade80, #22d3ee); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 100px; }
</style></head><body>
<h2>Our Solution</h2>
<div class="content">
<div class="text"><p>We provide an innovative platform that addresses all these challenges with a single, elegant solution. Our technology enables businesses to achieve more with less effort.</p></div>
<div class="visual"><div class="circle">✓</div></div>
</div>
</body></html>`
                }
            ]
        },
        {
            name: 'Creative Portfolio',
            description: 'Showcase your creative work',
            slideSize: { width: 1280, height: 720, name: 'PowerPoint 16:9' },
            slides: [
                {
                    id: 'portfolio_1',
                    type: 'html',
                    source: 'Intro Slide',
                    content: `<!DOCTYPE html>
<html><head><style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Georgia', serif; background: #000; height: 100vh; display: flex; align-items: center; justify-content: center; color: white; position: relative; overflow: hidden; }
.bg { position: absolute; inset: 0; background: repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.03) 35px, rgba(255,255,255,0.03) 70px); }
.container { text-align: center; z-index: 1; }
h1 { font-size: 80px; font-weight: 400; letter-spacing: 20px; margin-bottom: 20px; }
p { font-size: 20px; letter-spacing: 8px; opacity: 0.6; text-transform: uppercase; }
</style></head><body>
<div class="bg"></div>
<div class="container">
<h1>PORTFOLIO</h1>
<p>Creative Designer</p>
</div>
</body></html>`
                },
                {
                    id: 'portfolio_2',
                    type: 'html',
                    source: 'Work Grid',
                    content: `<!DOCTYPE html>
<html><head><style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', sans-serif; background: #111; height: 100vh; padding: 40px; color: white; }
h2 { font-size: 36px; margin-bottom: 30px; font-weight: 300; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; height: calc(100% - 80px); }
.item { background: linear-gradient(45deg, #ff6b6b, #feca57); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 600; }
.item:nth-child(2) { background: linear-gradient(45deg, #5f27cd, #341f97); }
.item:nth-child(3) { background: linear-gradient(45deg, #00d2d3, #54a0ff); }
.item:nth-child(4) { background: linear-gradient(45deg, #ff9ff3, #f368e0); }
.item:nth-child(5) { background: linear-gradient(45deg, #1dd1a1, #10ac84); }
.item:nth-child(6) { background: linear-gradient(45deg, #ffa502, #ff6348); }
</style></head><body>
<h2>Selected Works</h2>
<div class="grid">
<div class="item">Project 1</div>
<div class="item">Project 2</div>
<div class="item">Project 3</div>
<div class="item">Project 4</div>
<div class="item">Project 5</div>
<div class="item">Project 6</div>
</div>
</body></html>`
                }
            ]
        },
        {
            name: 'Minimal Report',
            description: 'Clean data presentation',
            slideSize: { width: 1123, height: 794, name: 'A4 Landscape' },
            slides: [
                {
                    id: 'report_1',
                    type: 'html',
                    source: 'Cover',
                    content: `<!DOCTYPE html>
<html><head><style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Helvetica Neue', sans-serif; background: white; height: 100vh; display: flex; color: #222; }
.left { width: 40%; background: #2d3436; display: flex; align-items: center; justify-content: center; }
.left span { font-size: 120px; color: white; font-weight: 700; }
.right { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 60px; }
h1 { font-size: 48px; font-weight: 300; margin-bottom: 20px; }
p { font-size: 18px; color: #636e72; }
.date { margin-top: auto; font-size: 14px; color: #b2bec3; }
</style></head><body>
<div class="left"><span>Q4</span></div>
<div class="right">
<h1>Quarterly Report</h1>
<p>Financial Overview & Analysis</p>
<p class="date">December 2024</p>
</div>
</body></html>`
                },
                {
                    id: 'report_2',
                    type: 'html',
                    source: 'Stats',
                    content: `<!DOCTYPE html>
<html><head><style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Helvetica Neue', sans-serif; background: #f8f9fa; height: 100vh; padding: 50px; color: #222; }
h2 { font-size: 32px; font-weight: 300; margin-bottom: 40px; color: #2d3436; }
.stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 30px; }
.stat { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
.stat .value { font-size: 42px; font-weight: 700; color: #0984e3; }
.stat .label { font-size: 14px; color: #636e72; margin-top: 10px; text-transform: uppercase; letter-spacing: 1px; }
.stat:nth-child(2) .value { color: #00b894; }
.stat:nth-child(3) .value { color: #6c5ce7; }
.stat:nth-child(4) .value { color: #fdcb6e; }
</style></head><body>
<h2>Key Metrics</h2>
<div class="stats">
<div class="stat"><div class="value">$2.4M</div><div class="label">Revenue</div></div>
<div class="stat"><div class="value">+34%</div><div class="label">Growth</div></div>
<div class="stat"><div class="value">1,247</div><div class="label">New Customers</div></div>
<div class="stat"><div class="value">98.5%</div><div class="label">Satisfaction</div></div>
</div>
</body></html>`
                }
            ]
        }
    ]
};