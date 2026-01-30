export function getCompany(companies, companyId) {
  return companies.find(company => company.id === companyId);
}

export function getOffers(offers, companyId) {
    console.log(offers)
  return offers.filter(offer => offer.companyId === companyId);
}


export function saveData() {
  const company = {
    name: "TechCorp",
    industry: "The Industry",
    description:
      "TechCorp is a technology-driven company focused on developing high-quality software solutions. We work with distributed teams and value autonomy, collaboration, and continuous learning.",
    catchPhrase: "Building scalable digital products for modern businesses.",
    logo: "https://www.svgrepo.com/show/303106/mcdonald-s-15-logo.svg",
    jobs: [
      {
        title: "Frontend Developer",
        modality: "Remote - Full Time",
        details:
          "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Voluptatem explicabo minus iure, ex praesentium temporibus exercitationem molestiae, repellat debitis sed quas fuga quo ipsa sapiente laboriosam, cumque quos eaque eligendi.",
      },
      {
        title: "Backend Developer",
        modality: "Remote - Half Time",
        details:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Error eius laudantium ad laboriosam dolores dolorem perspiciatis maiores harum aliquam voluptas consectetur sint quis, neque officia exercitationem, repellendus officiis debitis repellat?",
      },
    ],
  };
  localStorage.setItem("companyInfo", JSON.stringify(company));
}
