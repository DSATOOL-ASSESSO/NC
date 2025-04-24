
let data = [];
let postcodeMap = {};

async function loadData() {
  const [dataRes, postcodeRes] = await Promise.all([
    fetch('nmh-supplier-data.json'),
    fetch('postcodes-to-regions.json')
  ]);

  data = await dataRes.json();
  postcodeMap = await postcodeRes.json();

  populateSupportRoles();
}

function populateSupportRoles() {
  const roles = [...new Set(data.map(item => item['Support Roles']))].sort();
  const select = document.getElementById('role');
  roles.forEach(role => {
    const option = document.createElement('option');
    option.value = role;
    option.textContent = role;
    select.appendChild(option);
  });
}

function getRegionFromPostcode(postcode) {
  const prefix = postcode.toUpperCase().match(/^[A-Z]{1,2}/);
  if (!prefix) return null;
  return postcodeMap[prefix[0]] || null;
}

function filterData() {
  const postcode = document.getElementById('postcode').value.trim();
  const universityInput = document.getElementById('university').value.trim().toLowerCase();
  const selectedRole = document.getElementById('role').value;
  const selectedMode = document.getElementById('mode').value;
  const region = getRegionFromPostcode(postcode);

  const resultsContainer = document.getElementById('results');
  resultsContainer.innerHTML = '';

  if (!region) {
    resultsContainer.innerHTML = '<p>Unknown postcode region.</p>';
    return;
  }

  let results = data.filter(item =>
    item.Regions === region &&
    item['Support Roles'] === selectedRole &&
    item['Mode of Delivery'] === selectedMode
  );

  let uniMatches = [];
  let otherMatches = [];

  if (universityInput) {
    results.forEach(item => {
      if (item.Name.toLowerCase().includes(universityInput)) {
        uniMatches.push(item);
      } else {
        otherMatches.push(item);
      }
    });
    otherMatches.sort(() => Math.random() - 0.5);
    results = [...uniMatches, ...otherMatches];
  } else {
    results.sort(() => Math.random() - 0.5);
  }

  if (results.length === 0) {
    resultsContainer.innerHTML = '<p>No matching providers found.</p>';
    return;
  }

  const list = document.createElement('ul');
  results.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${item.Name}</strong><br>
      Phone: ${item['Main Contact Telephone Number']}<br>
      Email: ${item['Main Contact Email Address']}<br>
      ${item.Website ? 'Website: ' + item.Website + '<br>' : ''}
      ${item.Rates ? 'Rates: ' + item.Rates + '<br>' : ''}`;
    list.appendChild(li);
  });

  resultsContainer.appendChild(list);
}

window.onload = loadData;
