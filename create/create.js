function highlight(id) {
  let output = document.querySelector("#" + id);
  output.focus();
  output.select()
  output.setSelectionRange(0, output.value.length + 1);
  return output;
}

function validateInputs() {
  var inputs = document.querySelectorAll(".form .labeled-input input");
  for (let i = 0; i < inputs.length; i++) {
    let input = inputs[i];
    input.reportValidity = input.reportValidity || (() => true);
    if (!input.reportValidity()) {
      return false;
    }
  }

  const url = document.querySelector("#url");
  let urlObj;
  try {
    urlObj = new URL(url.value);
  } catch {
    if (!("reportValidity" in url)) {
      alert("URL invalid. Make sure to include 'http://' or 'https://' at the "
          + "beginning.");
    }
    return false;
  }

  if (!(urlObj.protocol == "http:"
        || urlObj.protocol == "https:"
        || urlObj.protocol == "magnet:")) {
    url.setCustomValidity("The link uses a non-hypertext protocol, which is "
        + "not allowed. The URL begins with " + urlObj.protocol + " and may be "
        + "malicious.");
    url.reportValidity();
    return false;
  }

  return true;
}

async function generateFragment(url, passwd, hint, useRandomSalt, useRandomIv) {
  const api = apiVersions[LATEST_API_VERSION];

  const salt = useRandomSalt ? await api.randomSalt() : null;
  const iv = useRandomIv ? await api.randomIv() : null;
  const encrypted = await api.encrypt(url, passwd, salt, iv);
  const output = {
    v: LATEST_API_VERSION,
    e: b64.binaryToBase64(new Uint8Array(encrypted))
  }

  if (hint != "") {
    output["h"] = hint;
  }

  if (useRandomSalt) {
    output["s"] = b64.binaryToBase64(salt);
  }
  if (useRandomIv) {
    output["i"] = b64.binaryToBase64(iv);
  }

  return b64.encode(JSON.stringify(output));
}

async function onEncrypt() {
  if (!validateInputs()) {
    return;
  }

  const password = document.querySelector("#password").value;
  const confirmPassword = document.querySelector("#confirm-password")
  const confirmation = confirmPassword.value;
  if (password != confirmation) {
    confirmPassword.setCustomValidity("Passwords do not match");
    confirmPassword.reportValidity();
    return;
  }

  const url = document.querySelector("#url").value;
  const useRandomIv = document.querySelector("#iv").checked;
  const useRandomSalt = document.querySelector("#salt").checked;

  const hint = document.querySelector("#hint").value

  const encrypted = await generateFragment(url, password, hint, useRandomSalt,
      useRandomIv);
  const output = `https://rage73.github.io/URL-Ncrypt/#${encrypted}`;

  document.querySelector("#output").value = output;
  highlight("output");

  document.querySelector("#bookmark").href = `https://rage73.github.io/URL-Ncrypt/hidden/#${encrypted}`;
  document.querySelector("#open").href = output;

  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth",
  });
}

function onCopy(id) {

  const output = highlight(id);
  document.execCommand("copy");

  output.selectionEnd = output.selectionStart;
  output.blur();
}
