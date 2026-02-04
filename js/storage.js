const API_URL = "http://localhost:4001";

export async function verifyUser(user) {
    try {
        const response = await fetch('http://localhost:4001/users'); // Await the response
        const data = await response.json(); // Await the JSON parsing
        console.log(data);

        for (let i = 0; i < data.length; i++) {
            if (data[i].email === user.email) {
                console.log("aqui lo encuentra")
                console.log(data[i])
                return data[i]
            }
        }
        console.log("not found")
        return false
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

export async function saveUser(user) {
    try {
        const response = await fetch('http://localhost:4001/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        });

        const responseData = await response.json();
        console.log('Success:', responseData);
        return responseData;

    } catch (error) {
        console.error('Error:', error);
    }
}

export async function saveCandidate(candidate) {
    try {
        const response = await fetch('http://localhost:4001/candidates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(candidate)
        });

        const responseData = await response.json();
        console.log('Success:', responseData);
        return responseData;

    } catch (error) {
        console.error('Error:', error);
    }
}

export async function saveCompany(company) {
    try {
        const response = await fetch('http://localhost:4001/companies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(company)
        });

        const responseData = await response.json();
        console.log('Success:', responseData);
        return responseData;

    } catch (error) {
        console.error('Error:', error);
    }
}

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
