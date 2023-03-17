const URL = "https://api.github.com/search/repositories";
const main = document.querySelector(".main");

const div = document.createElement("div");
div.classList.add("search");

const form = document.createElement("form");
form.classList.add("search__form");

const input = document.createElement("input");
input.classList.add("search__input");

const searchBtn = document.createElement("button");
searchBtn.classList.add("search__button");
searchBtn.setAttribute("type", "submit");
searchBtn.innerText = "Поиск";
searchBtn.disabled = true;

const container = document.createElement("ul");
container.classList.add("lists");

const countSpan = document.createElement("h3");
countSpan.classList.add("lists__span");

const loader = document.createElement("div");
loader.classList.add("loader");

const popup = document.createElement("div");
popup.classList.add("popup");

const popupWrapper = document.createElement("div");
popupWrapper.classList.add("popup__wrapper");

const closeBtn = document.createElement("button");
closeBtn.classList.add("popup__button");
closeBtn.setAttribute("type", "button");
closeBtn.innerText = "X";

const errSpan = document.createElement("span");
errSpan.classList.add("error");

popup.appendChild(popupWrapper);
main.appendChild(div);
div.appendChild(form);
form.appendChild(input);
form.appendChild(searchBtn);
form.appendChild(errSpan);
main.appendChild(loader);
document.body.append(popup);

const valid = () => {
  let err;
  let count = input.value.length;
  if (count < 2) {
    err = false;
    errSpan.style.visibility = "visible";
    errSpan.innerText = `Введите минимум 2 символа, введено - ${count}`;
  } else {
    err = true;
    errSpan.style.visibility = "hidden";
  }
  return err;
};

input.addEventListener("change", function () {
  valid();
  this.value != "" && valid()
    ? (searchBtn.disabled = false)
    : (searchBtn.disabled = true);
});

input.addEventListener("input", function () {
  this.value != "" && valid()
    ? (searchBtn.disabled = false)
    : (searchBtn.disabled = true);
});

const checkRes = async (res) => {
  if (res.ok) {
    loader.classList.remove("visible");
    let data = await res.json();
    createElements(data);
    countSpan.innerHTML = `Найдено: ${data.total_count} результатов.`;
    if (data.total_count == 0) {
      createPopup(data);
      container.remove(this.children);
    }
  } else {
    createPopup(res);
  }
  return res;
};

function createPopup(res) {
  console.log(res);
  let mess;
  if (res.total_count == 0) {
    mess = "Ни чего не найдено";
  } else if (res.status == 422) {
    mess = "Validation failed, or the endpoint has been spammed.";
  } else if (res.status == 304) {
    mess = "Not modified";
  } else if (res.status == 503) {
    mess = "Service unavailable";
  } else if (res.status == 404) {
    mess = "Not found";
  }
  loader.classList.remove("visible");
  popup.style.display = "flex";
  popupWrapper.innerHTML = `
          <div class="popup__img"></div>
          <h3 class="popup__span">${mess}</h3>
          `;
  popupWrapper.appendChild(closeBtn);
  document.body.style.overflow = "hidden";
  return;
}

closeBtn.addEventListener("click", function () {
  popup.style.display = "none";
  document.body.style.overflow = "";
});

async function getRepo() {
  try {
    const response = await fetch(`${URL}?q=${input.value}`, {
      headers: {
        accept: "application/vnd.github+json",
      },
    });
    checkRes(response);
  } catch (error) {
    console.log(error);
    createPopup(error);
  }
}

form.addEventListener("submit", async function (e) {
  container.remove(this.children);
  loader.classList.add("visible");
  e.preventDefault();
  getRepo();
  form.reset();
  searchBtn.disabled = true;
});

function createElements(key) {
  let user = [];
  user = key.items;
  let sliceUser = user.slice(0, 12);

  for (let person of sliceUser) {
    const item = document.createElement("li");
    item.classList.add("lists__item");
    item.innerHTML = `
              <img class="lists__image" src=${person.owner.avatar_url} alt="Аватар">
              <span class="lists__login">${person.full_name}</span>
              <span class="lists__description">${person.description}</span>
              <a class="lists__link-repos" href=${person.owner.html_url} target="_blank">Ссылка на репозиторий</a>
            `;

    container.prepend(item);
    container.prepend(countSpan);
  }
  render();
}

function render() {
  main.appendChild(container);
}
