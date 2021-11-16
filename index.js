function error(text) {
  document.querySelector(".error").style.display = "inherit";
  document.querySelector("#errortext").innerText = `Error: ${text}`;
}

async function main() {
  if (window.location.hash) {

    if (!("b64" in window)) {
      error("Base64 library not loaded.");
      return;
    }
    if (!("apiVersions" in window)) {
      error("API library not loaded.");
      return;
    }

    const hash = window.location.hash.slice(1);
    let params;
    try {
      params = JSON.parse(b64.decode(hash));
    } catch {
      error("The link appears corrupted.");
      return;
    }

    if (!("v" in params && "e" in params)) {
      error("The link appears corrupted. The encoded URL is missing necessary parameters.");
      return;
    }

    if (!(params["v"] in apiVersions)) {
      error("Unsupported API version. The link may be corrupted.");
      return;
    }

    const api = apiVersions[params["v"]];

    const encrypted = b64.base64ToBinary(params["e"]);
    const salt = "s" in params ? b64.base64ToBinary(params["s"]) : null;
    const iv = "i" in params ? b64.base64ToBinary(params["i"]) : null;

    let hint, password;
    if ("h" in params) {
      hint = params["h"];
      password = prompt(`Please enter the password to unlock the link.\n\nHint: ${hint}`);
    } else {
      password = prompt("Please enter the password to unlock the link.");
    }

    let url;
    try {
      url = await api.decrypt(encrypted, password, salt, iv);
    } catch {
      error("Password is incorrect.");
      document.querySelector("#no-redirect").href =
        `https://rage73.github.io/URL-Ncrypt/decrypt/#${hash}`;
      document.querySelector("#hidden").href =
        `https://rage73.github.io/URL-Ncrypt/hidden/#${hash}`;
      return;
    }

    try {
      let urlObj = new URL(url);
      if (!(urlObj.protocol == "http:" ||
          urlObj.protocol == "https:" ||
          urlObj.protocol == "magnet:")) {
        error(`The link uses a non-hypertext protocol, which is not allowed. ` +
          `The URL begins with "${urlObj.protocol}" and may be malicious.`);
        return;
      }
      window.location.href = url;
    } catch {
      error("A corrupted URL was encrypted. Cannot redirect.");
      console.log(url);
      return;
    }
  } else {
    window.location.replace("./create");
  }
}