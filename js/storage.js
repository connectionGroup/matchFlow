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

export async function patchOffer(offerId, updatedFields) {
  try {
    const response = await fetch(`${API_URL}/jobOffers/${offerId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedFields)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error in patchOffer:", error);
    throw error;
  }
}


export async function deleteJobOffer(offerId) {
  const deleted = await fetch(`${API_URL}/jobOffers/${offerId}`, {
    method: "DELETE"
  });

  return await deleted.json();
}
