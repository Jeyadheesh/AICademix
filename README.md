
# AICademix

AICademix is an innovative EdTech platform that provides personalized, adaptive learning experiences. Experiencing cutting-edge AI technologies, our platform tackles the challenges posed by traditional EdTech solutions by offering interactive, real-time feedback and a rich array of creative tools that provide diverse learning styles.

## Table of Contents
- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Proposed Solution](#proposed-solution)
- [Features](#features)
- [Architecture Design](#architecture-design)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Getting Started](#getting-started)
- [Future Scope](#future-scope)
- [License](#license)

## Overview
**Domain:** EdTech  
**Team:** Novicers

AICademix aims to revolutionize education by integrating adaptive learning methods with innovative AI-driven content creation. Our system addresses the diverse needs of students through interactive tools such as AI Assessment, Story Narrator, Comic Generator, and Rhymes Generator. These features transform complex topics into accessible, engaging, and personalized educational experiences.

## Problem Statement
Despite the widespread adoption of EdTech platforms like Khan Academy, Coursera, Byju’s, and Vedantu, significant challenges remain. Many of these platforms rely on static content and generic assessments that do not cater to individual students' varied learning styles and paces. This often results in disengagement, reduced motivation, and inadequate mastery of subjects.

To truly support lifelong learning and ensure inclusive, equitable, quality education in line with Sustainable Development Goal 4, there is a need for innovative solutions that can:
- Offer adaptive learning experiences.
- Provide real-time feedback.
- Create interactive and personalized content.

## Proposed Solution
AICademix addresses these gaps with a suite of AI-powered tools:
- **AI Assessment:** Generates multiple-choice questions using Retrieval-Augmented Generation (RAG) techniques and provides personalized flashcards to reinforce weak areas.
- **Story Narrator:** Converts content into engaging narratives, optionally narrated to enhance understanding.
- **Comic Generator:** Transforms complex topics into fun, easy-to-understand comics enriched with AI-powered imagery.
- **Rhymes Generator:** Converts challenging subjects into memorable rhymes for better retention.

## Features
- **Adaptive Learning:** Personalized content adapted to individual students’ needs.
- **Interactive Assessments:** Real-time feedback through AI-driven quizzes and flashcards.
- **Creative Content Generation:** Comics, stories, and rhymes to simplify complex topics.
- **Seamless Integration:** Combines the power of Gemini 2.0 LLM, RAG, and Stable Diffusion to produce unique educational materials.

## Architecture Design
![comic](https://github.com/user-attachments/assets/439e675b-484f-4d49-a69c-34d14aa70c68)

- Students upload materials with doubtful topics, and our app uses Gemini 2.0  LLM with RAG to generate scripts and Stable Diffusion to create images, producing personalized comics.

![Assessment](https://github.com/user-attachments/assets/e9f5131b-8738-465f-b077-582b1274184d)

- Students upload materials with a concept, and our app uses Gemini 2.0 LLM with RAG to generate questions and conducts assessment with personalized feedback on completion.

## Tech Stack
- **Frontend:** Next.js, TailwindCSS, TypeScript
- **Backend:** MongoDB, Qdrant (Vector DB), Langchain, Gemini 2.0 Flash, Stable Diffusion
- **Containerization:** Docker

## Prerequisites
Before getting started, ensure you have the following installed:
- **Docker:** For container management and running Qdrant.
- **.env File:** Ensure you configure your environment variables appropriately.
- **Qdrant Setup:**
  - Pull the Qdrant Docker image:
    ```bash
    docker pull qdrant/qdrant
    ```

## Installation and Setup
1. **Clone the Repository:**
   ```bash
   [git clone https://github.com/yourusername/AICademix.git](https://github.com/Jeyadheesh/AICademix.git)
   cd AICademix
   ```

2. **Install Dependencies:**
   Use npm to install all project dependencies:
   ```bash
   npm i
   ```

3. **Set Up Environment Variables:**
   Create and configure your `.env` file as per the project requirements.

## Getting Started
### Start Qdrant
1. **Run Qdrant in a Docker Container:**
   Execute the following command to run Qdrant:
   ```bash
   docker run -p 6333:6333 -p 6334:6334 \
       -v "$(pwd)/qdrant_storage:/qdrant/storage:z" \
       qdrant/qdrant
   ```
   Qdrant will run on:
   - **Port 6333:** REST API
   - **Port 6334:** Web UI

### Start the Development Server
2. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Future Scope
AICademix is designed with scalability in mind. Future Plans include:
![Future Scope](https://github.com/user-attachments/assets/4c5b3438-9751-4ad8-80a9-da91ef1168e3)

- Implementing B2B and B2C business models (school licenses and individual subscriptions).
- Expanding into global markets.
- Integrating AI-powered curriculum customization for personalized learning paths.



## License
This project is licensed under the [MIT License](LICENSE).

---

Happy learning and coding!
