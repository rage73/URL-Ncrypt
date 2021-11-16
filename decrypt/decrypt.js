function highlight(id) {
  let output = document.querySelector("#" + id);
  output.focus();
  output.select()
  output.setSelectionRange(0, output.value.length + 1);
  return output;
}

function error(text) {
  const alertText = document.querySelector(".alert");
  alertText.innerText = text;
  alertText.style.opacity = 1;
}

async function onDecrypt() {
  if (!("b64" in window && "apiVersions" in window)) {
    error("Important libraries not loaded!");
    return;
  }

  const urlText = document.querySelector("#encrypted-url").value;
  let url;
  try {
    url = new URL(urlText);
  } catch {
    error("Entered text is not a valid URL. Make sure it includes \"https://\" too!");
    return;
  }

  let params;
  try {
    params = JSON.parse(b64.decode(url.hash.slice(1)));
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

  const password = document.querySelector("#password").value;

  let decrypted;
  try {
    decrypted = await api.decrypt(encrypted, password, salt, iv);
  } catch {
    error("Incorrect password!");
    return;
  }

  document.querySelector("#output").value = decrypted;
  document.querySelector("#open").href = decrypted;
}

function onCopy(id) {
  const output = highlight(id);
  document.execCommand("copy");

  output.selectionEnd = output.selectionStart;
  output.blur();
}

function main() {
  if (window.location.hash) {
    document.querySelector("#encrypted-url").value =
      `https://rage73.github.io/URL-Ncrypt/${window.location.hash}`;
  }
}