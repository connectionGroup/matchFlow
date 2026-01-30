const API_URL = "http://localhost:4001";

export async function fetchCompanies() {
  const response = await fetch(`${API_URL}/companies`);
  return response.json();
}

export async function fetchJobOffers() {
  const response = await fetch(`${API_URL}/jobOffers`);
  return response.json();
}

export async function saveOffer(offer){
    const response = await fetch(`${API_URL}/jobOffers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(offer)
  });

  return response.json();
}

export async function updateOffer(offerId, updatedFields) {
  const response = await fetch(`${API_URL}/jobOffers/${offerId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(updatedFields)
  });

  return response.json();
}

export async function deleteJobOffer(offerId) {
  await fetch(`${API_URL}/jobOffers/${offerId}`, {
    method: "DELETE"
  });
}
