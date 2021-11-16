function error(text) {
  const alertText = document.querySelector(".alert");
  alertText.innerHTML = text;
  alertText.style.opacity = 1;
}

async function onHide() {

  if (!("b64" in window && "apiVersions" in window)) {
    error("Important libraries not loaded!");
    return;
  }

  let urlText = document.querySelector("#encrypted-url").value;
  let hiddenUrl;
  try {
    hiddenUrl = new URL(urlText);
  } catch {
    error("Hidden URL is not valid. Make sure it includes \"https://\" too!");
    return;
  }

  urlText = document.querySelector("#bookmark-url").value;
  let bookmarkUrl;
  try {
    bookmarkUrl = new URL(urlText);
  } catch {
    error("Bookmark URL is not valid. Make sure it includes \"https://\" too!");
    return;
  }

  let hash = hiddenUrl.hash.slice(1);
  try {
    let _ = JSON.parse(b64.decode(hash));
  } catch {
    error("The hidden URL appears corrupted. It must be a password-protected Link Lock URL. <a href=\"https://rage73.github.io/URL-Ncrypt\">Click here to add a password.</a>");
    return;

  }

  let output = document.querySelector("#output");

  bookmarkUrl.hash = hiddenUrl.hash;
  output.setAttribute("href", bookmarkUrl.toString());

  output.setAttribute("aria-disabled", "false");

  output.innerText = document.querySelector("#bookmark-title").value;

  error("Bookmark created below.");

  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth",
  });
}

function onChangeDecrypt() {
  let newUrl;
  try {
    const newUrlInput = document.querySelector("#decrypt-bookmark-disguise");
    const _ = new URL(newUrlInput.value);
    newUrl = newUrlInput.value;
  } catch (_) {
    return;
  }

  const decryptBookmark = document.querySelector("#decrypt-bookmark");
  decryptBookmark.href = decryptBookmark.href.replace(/replace\("[^"]*"\)/, `replace("${newUrl}")`);
  console.log(decryptBookmark.href);
}

async function randomLink() {
	let page = await fetch("https://en.wikipedia.org/w/api.php?"
			+ "format=json"
			+ "&action=query"
			+ "&generator=random"
			+ "&grnnamespace=0"
			+ "&prop=info"
			+ "&inprop=url"
			+ "&origin=*")
		.then(r => r.json())
		.then(d => {
			let pages = d.query.pages;
			return pages[Object.keys(pages)[0]];
		});

  document.querySelector("#bookmark-url").value = await page.canonicalurl;
  document.querySelector("#bookmark-title").value = await page.title;
}

function main() {
  if (window.location.hash) {
    document.querySelector("#encrypted-url").value =
      `https://rage73.github.io/URL-Ncrypt/${window.location.hash}`;

    window.location.hash = "";
  }
}
