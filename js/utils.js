


export function saveData() {
    const company = {
    name:'TechCorp',
    industry:'The Industry',
    description: 'TechCorp is a technology-driven company focused on developing high-quality software solutions. We work with distributed teams and value autonomy, collaboration, and continuous learning.',
    catchPhrase: 'Building scalable digital products for modern businesses.',
    logo: 'https://www.svgrepo.com/show/303106/mcdonald-s-15-logo.svg',
    jobs:[{
        title:'Frontend Developer',
        details: 'Remote - Full Time',
    },
    {
        title:'Backend Developer',
        details: 'Remote - Half Time',
    }],
}
    localStorage.setItem('companyInfo', JSON.stringify(company))
}
