require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('Please set MONGODB_URI');
    process.exit(1);
}

const projectData = {
    "title": "Multi-LLM Council System",
    "slug": "multi-llm-council",
    "description": "A multi-agent AI system that orchestrates multiple LLMs to generate, review, and synthesize responses through a structured consensus mechanism, improving reliability and reducing hallucinations.",
    "projectMarkdown": "## 🌟 Overview\n\nThe **Multi-LLM Council System** is a multi-agent AI architecture designed to improve response reliability by orchestrating multiple Large Language Models (LLMs) in a structured consensus workflow.\n\nInstead of relying on a single model, the system simulates a panel of AI experts that independently generate, review, and synthesize responses—reducing hallucinations and increasing confidence in outputs.\n\n---\n\n## 🧠 How It Works\n\n1. **Parallel Query Distribution**\n   A user query is sent to multiple LLMs simultaneously.\n\n2. **Independent Generation**\n   Each model generates its own response without influence from others.\n\n3. **Cross-Review Phase**\n   Models evaluate peer responses for:\n   - Accuracy\n   - Completeness\n   - Clarity\n   - Logical consistency\n\n4. **Consensus Synthesis**\n   A designated arbitrator model combines the strongest elements into a final response.\n\n5. **Final Output**\n   The user receives a refined, consensus-backed answer with optional decision metadata.\n\n---\n\n## 🏗 Architecture\n\nThe system is orchestrated using **n8n**, enabling parallel execution, review loops, and controlled aggregation.\n\n- Parallel LLM invocation\n- Structured review pipelines\n- Fail-safe orchestration logic\n\n---\n\n## 🛠 Tech Stack\n\n- **Workflow Orchestration**: n8n\n- **LLMs**:\n  - Google Gemini (cloud)\n  - Ollama (local models)\n- **Architecture Pattern**: Multi-agent consensus system\n- **Integration**: REST APIs & Webhooks\n\n---\n\n## 🎯 Why Multi-LLM?\n\n- **Reduced Hallucinations** via peer review\n- **Bias Mitigation** using diverse model perspectives\n- **Higher Reliability** compared to single-model systems\n- **Graceful Degradation** if one model fails\n\nThis mirrors real-world expert panels rather than single-author decisions.\n\n---\n\n## 📦 Repository Structure\n\nmulti-llm-council/\n├── workflows/ # n8n workflow definitions\n├── diagrams/ # Architecture diagrams\n├── screenshots/ # Workflow execution examples\n├── README.md\n└── LICENSE\n\n---\n\n## ⚠️ Note\n\nThis is an experimental multi-agent AI orchestration system.\nProduction deployment would require additional controls such as authentication, rate limiting, and monitoring.\n",
    "tags": [
        "multi-agent",
        "llm",
        "ai-systems",
        "n8n",
        "orchestration",
        "generative-ai",
        "consensus-ai",
        "rag",
        "automation",
        "backend",
        "ai-architecture"
    ],
    "githubUrl": "https://github.com/AnshGajera/multi-llm-council",
    "images": [
        {
            "url": "https://res.cloudinary.com/dedm8zbh4/image/upload/v1769581231/portfolio/vpobbmeorzwsu8g5tklh.png",
            "showOnProject": true
        },
        {
            "url": "https://res.cloudinary.com/dedm8zbh4/image/upload/v1769581275/portfolio/iqxefmonw12ltkhuo6mn.png",
            "caption": "",
            "showOnProject": false
        }
    ],
    "active": true,
    "featured": false,
    "status": "draft",
    "priority": 1
};

async function seed() {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;

    // Upsert the project based on slug
    const result = await db.collection('projects').updateOne(
        { slug: projectData.slug },
        { $set: projectData },
        { upsert: true }
    );

    console.log('Seeding complete.');
    console.log('Matched:', result.matchedCount);
    console.log('Modified:', result.modifiedCount);
    console.log('UpsertedId:', result.upsertedId);

    await mongoose.disconnect();
}

seed().catch(console.error);
