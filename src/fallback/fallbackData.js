import coveo from './assets/coveo.png';
import consoltec from './assets/consoltec.png';
import sitecore from './assets/sitecore.png';
import concordia from './assets/concordia.png';

export const fallbackData = {
    projects: [
        {
            id: 5,
            name: 'BestFood',
            description: 'Food e-commerce website',
            technologies: [
                'Java',
                'Spring Boot',
                'MySQL',
                'Bootstrap'
            ],
            link: 'https://bestfood.mohammadalshikh.com',
            github: 'https://github.com/mohammadalshikh/bestfood',
        },
        {
            id: 4,
            name: 'MindSync',
            description: "Discord bot with LLM integration",
            technologies: [
                'Discord.js',
                'OpenAI API'
            ],
            link: null,
            github: 'https://github.com/mohammadalshikh/mindsync',
        },
        {
            id: 3,
            name: 'True Clear Terminal',
            description: 'VS Code extension to clear integrated terminal and scroll-back buffer',
            technologies: [
                'TypeScript',
                'JavaScript'
            ],
            link: 'https://marketplace.visualstudio.com/items?itemName=mohammadalshikh.true-clear-terminal',
            github: 'https://github.com/mohammadalshikh/true-clear-terminal-vscode',
        },
        {
            id: 2,
            name: 'ConcoGrades',
            description: 'Classroom management web-app',
            technologies: [
                'Python',
                'Flask',
                'JavaScript',
                'Bootstrap'
            ],
            link: 'https://concogrades.mohammadalshikh.com',
            github: 'https://github.com/mohammadalshikh/concogrades',
        },
        {
            id: 1,
            name: "SolarScope",
            description: "Solar system simulation",
            technologies: [
                "C++",
                "OpenGL",
                "Assimp"
            ],
            link: null,
            github: "https://github.com/mohammadalshikh/comp-371-project",
        }
    ],
    about: {
        intro: `Hi there! I’m Mohammad, a final-year Computer Science student at Concordia and a developer who enjoys turning ideas into thoughtful web experiences. \n\nOver the past few years I’ve explored a wide range of technologies, and I’m now focused on building modern and scalable web apps.`,
        skills: [
            'Python',
            'C#',
            'Java',
            'Spring Boot',
            'Flask',
            'React',
            'Angular',
            'SQL'
        ],
    },
    experiences: [
        {
            id: 3,
            company: 'Coveo',
            position: 'Software Developer Intern',
            duration: 'Jan. 2025 - Aug. 2025',
            description: "Leveraged Coveo's Headless and Atomic frameworks to enhance search efficiency and personal recommendations.",
            technologies: [
                'Python',
                'React',
                'Angular',
                'C#',
                'Azure DevOps'
            ],
            image: coveo
        },
        {
            id: 2,
            company: 'Consoltec',
            position: 'Web Developer Intern',
            duration: 'May 2024 - Aug. 2024',
            description: 'Working on key features and bug fixes to enhance product stability and user satisfaction, while also engaging in daily meetups.',
            technologies: [
                'C#',
                'Angular',
                'JavaScript',
                'SQL Server'
            ],
            image: consoltec
        },
        {
            id: 1,
            company: 'Sitecore',
            position: 'Software Engineer Intern',
            duration: 'Jan. 2024 - Apr. 2024',
            description: 'Collaborated with the deployment team to develop Sitecore-based websites, resolve maintenance issues, and perform structured bug analysis.',
            technologies: [
                'C#',
                'ASP.NET',
                'IIS',
                'SQL Server'
            ],
            image: sitecore
        },
    ],
    education: [
        {
            id: 1,
            institution: 'Concordia University',
            degree: 'Bachelor of Computer Science',
            field: '',
            duration: 'Jan. 2021 - Apr. 2026',
            achievements: [
                'VP - Google Developer Student Club',
            ],
            image: concordia
        },
    ],
};
