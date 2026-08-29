export interface DeveloperExperience {
  role: string;
  company: string;
  locationType: 'Remote' | 'Hybrid' | 'On-site';
  period: string;
  grade?: string;
  highlights: string[];
  skills: string[];
}

export interface DeveloperProject {
  title: string;
  techStack: string[];
  githubUrl?: string;
  highlights: string[];
  badge?: string;
}

export interface DeveloperEducation {
  institution: string;
  degree: string;
  location: string;
  period: string;
}

export interface DeveloperProfile {
  name: string;
  title: string;
  location: string;
  phone: string;
  email: string;
  linkedin: string;
  github: string;
  portfolio: string;
  summary: string;
  technicalSkills: {
    category: string;
    skills: string[];
  }[];
  experience: DeveloperExperience[];
  projects: DeveloperProject[];
  education: DeveloperEducation;
  certifications: string[];
}

export const NAVNEET_GUPTA_PROFILE: DeveloperProfile = {
  name: 'Navneet Gupta',
  title: 'Full Stack Developer & AI / Machine Learning Engineer',
  location: 'Greater Noida, India',
  phone: '+91-7317567350',
  email: 'indianavneetgupta33@gmail.com',
  linkedin: 'https://www.linkedin.com/in/navneet-gupta-4a1644297',
  github: 'https://github.com/Navneetgupta440',
  portfolio: 'https://portfolio-ng440.netlify.app/',
  summary:
    'Full Stack Developer with 6+ months of hands-on experience building REST APIs, full-stack web applications, and data preprocessing pipelines. Automated preprocessing workflows for 3 ML datasets and integrated SQL/NoSQL databases using Python, SQL, and Java. Comfortable across the stack, from schema design and API architecture to model training and evaluation.',
  technicalSkills: [
    {
      category: 'Languages',
      skills: ['Java', 'Python', 'SQL', 'JavaScript', 'TypeScript', 'C'],
    },
    {
      category: 'Web & Backend',
      skills: [
        'React.js',
        'Node.js',
        'Express.js',
        'REST APIs',
        'JWT Authentication',
        'Tailwind CSS',
        'HTML5/CSS3',
      ],
    },
    {
      category: 'Databases & Storage',
      skills: ['MongoDB', 'MySQL', 'PostgreSQL', 'Mongoose', 'Database Indexing'],
    },
    {
      category: 'Data Science & Machine Learning',
      skills: [
        'Pandas',
        'NumPy',
        'TensorFlow',
        'Keras',
        'Scikit-Learn',
        'OpenCV',
        'CNN (Convolutional Neural Networks)',
        'ETL Workflows',
        'Power BI',
      ],
    },
    {
      category: 'Developer Tools & Cloud',
      skills: [
        'Git / GitHub',
        'GitHub Actions (CI/CD)',
        'AWS',
        'VS Code',
        'Cursor',
        'Agile / Scrum',
        'Docker',
        'Postman',
      ],
    },
  ],
  experience: [
    {
      role: 'MERN Stack Developer Intern',
      company: 'Codec Technologies Pvt. Ltd.',
      locationType: 'Remote',
      period: 'Sep. 2025 – Dec. 2025',
      skills: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'JWT', 'REST APIs', 'Agile'],
      highlights: [
        'Developed and maintained 5+ full-stack modules using React.js, Node.js, Express.js, and MongoDB, improving data storage and retrieval efficiency by 20%.',
        'Designed and implemented 10+ RESTful API endpoints handling structured data flow, authentication, and authorization using JWT.',
        'Optimized database queries (indexing and query restructuring), reducing average application response time by 25% and improving system reliability.',
        'Collaborated with a 4-member Agile team across 6 sprint cycles, participating in code reviews and sprint planning.',
      ],
    },
    {
      role: 'Python & Machine Learning Intern',
      company: 'Softpro India Computer Technologies Pvt. Ltd.',
      locationType: 'Hybrid',
      period: 'Sep. 2024 – Nov. 2024',
      grade: 'Earned A++ Grade (Top Performance Rating)',
      skills: ['Python', 'Pandas', 'NumPy', 'TensorFlow', 'Scikit-Learn', 'Power BI', 'Data Quality'],
      highlights: [
        'Automated data preprocessing pipelines for 3 real-world datasets using Python, Pandas, and NumPy, cutting manual processing time by 30%.',
        'Trained and evaluated 4 machine learning models with TensorFlow and Scikit-Learn, achieving up to 90% accuracy in model evaluation on held-out test data.',
        'Built 5+ Power BI dashboards to visualize processed data, enabling faster business decision-making for stakeholders.',
        'Validated data quality with senior team members through consistency checks and outlier review, reducing data inconsistencies by 15% across analysis workflows.',
        'Earned an A++ grade (top performance rating) for outstanding internship contribution.',
      ],
    },
  ],
  projects: [
    {
      title: 'Pneumonia Detection Using Chest X-Rays',
      techStack: ['Python', 'TensorFlow', 'Keras', 'OpenCV', 'CNN'],
      githubUrl: 'https://github.com/Navneetgupta440',
      badge: 'Deep Learning / Medical AI',
      highlights: [
        'Engineered an end-to-end data pipeline for medical image classification using CNNs, processing 5,000+ chest X-ray images across ingestion, preprocessing, augmentation, and training stages.',
        'Achieved strong classification performance on the validation set by applying data cleaning, normalization, and augmentation techniques to handle inconsistent image quality.',
        'Structured the pipeline into 4 modular, reusable stages to support fast retraining on updated datasets.',
      ],
    },
    {
      title: 'Full-Stack E-Commerce Platform',
      techStack: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'JWT'],
      githubUrl: 'https://github.com/Navneetgupta440',
      badge: 'Production Web App',
      highlights: [
        'Architected a full-stack e-commerce application with REST APIs integrated with MongoDB, supporting scalable product, order, and user data storage.',
        'Implemented JWT authentication and secure access controls, protecting user and order data across all endpoints.',
        'Normalized database schemas across 3 core entities (products, orders, users) to ensure data consistency and efficient querying.',
      ],
    },
  ],
  education: {
    institution: 'Accurate Institute of Management and Technology (AKTU)',
    degree: 'Bachelor of Technology in Computer Science and Engineering',
    location: 'Greater Noida, India',
    period: 'Oct. 2023 – Aug. 2027',
  },
  certifications: [
    'AICTE & ICAC Approved MERN Stack Development Certification',
    'Deloitte Australia Data Analytics Job Simulation',
    'Data Science Certification',
    'Python Programming Certification',
    'C Programming Certification',
    'Full Stack Development Internship (Bharat Intern)',
  ],
};
