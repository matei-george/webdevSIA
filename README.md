# MERN Bookstore

Aplicatie MERN Bookstore laborator SIA Grupa 2.

With 💚 by Mat(2.718)i.

## 😬 First time?

Nu e problema. Foloseste **git bash** intr-un folder nou si foloseste aceasta comanda:

`git clone` + URL-ul HTTP obtinut de pe Github.

⚠ Atentie! Vei avea nevoie de un **cont de GitHub** functional.

## 🤔 How to run?

Pentru inceput, asigura-te ca esti la zi cu proiectul.

Scrie in terminal `git pull origin main` pentru a prelua ultimele date din branch-ul principal, _main_.

Dupa, in editorul tau preferat vei avea nevoie de 2 terminale:

-  un terminal pentru **frontend**
-  un terminal pentru **backend**

Asigura-te inainte sa incepi ca esti pe folderul de baza al proiectului.
<img width="722" height="410" alt="carbon" src="https://github.com/user-attachments/assets/f3ba3779-e7c4-487b-9120-cc7d4af84254" />

### Frontend:

Asigura-te ca esti pe folderul de frontend. Poti face asta folosind comanda in terminal:

`cd frontend`

Odata ajuns aici, ruleaza aceasta comanda pentru a porni frontend-ul:

`npm run dev`

### Backend:

Asigura-te ca esti pe folderul de backend. Poti face asta folosind comanda in terminal:

`cd backend`

Odata ajuns aici, ruleaza aceasta comanda pentru a porni backend-ul:

`npm run dev`

---

## 💳 Stripe login information

### 🛠 Pentru instalarea serviciului de plata Stripe

Ruleaza aceste comenzi in terminal

`npm install stripe`

`npm install @stripe/stripe-js @stripe/react-stripe-js`

### 🧪 Date de testare Stripe

| Parameter          | Type                     |
| :----------------- | :----------------------- |
| email              | `popescu.ionel@mail.com` |
| numar card         | `4242 4242 4242 4242`    |
| data expirare card | `12/34`                  |
| CVC                | `123`                    |
| nume titular       | `Popescu Ionel`          |

---

## 🔬 Testare functii backend

In `v6.11` au fost adaugate sistemul de login prin bcrypt precum si sistemul de token authentication cu rutele necesare in `server.js`.

Pentru testarea functiilor au fost puse in _Laborator 6_ cateva functii de curl care au fost adaugate in fisierul `backend_tests.txt`.

Acesta poate fi gasit la locatia

```
mern-bookstore
└── backend
    └── data
        └── __tests__
            └── backend_tests.txt
```

Pentru testarea functiilor trebuie sa ne asiguram ca :

1. un terminal este deschis cu back-end-ul activ
2. un alt terminal gol este deschis pentru testarea rutelor necesare.

Fiecare comanda este plasata in terminalul gol pentru a furniza rezultatul dorit.

#### Observatii

Comanda 8 (_Combinatie de filtre_) nu functioneaza implicit cu tag-ul de categorie`category=General` pentru ca nu exista si nu a fost definit inca. A fost inlocuit cu `category=Programare` pentru ca este valid si ofera cel putin un rezultat ca raspuns.

---

## 💻 Administrator

In `v13.11` a fost adaugata functionalitatea de logare pe post de _administrator_ cu rutele in `App.jsx`.

Pentru a ne conecta la panelul de administrator folosim url-ul:

`http://localhost:5173/admin/login`

unde introducem credentialele necesare (email + parola).

🚧 Logarea ca administrator va duce implicit catre panelul de produse, care in `v13.11` nu este inca configurat.

---

## 🏗 Changelog

[ ✨ 13.11.2025 ] `v13.11` → Adaugare AdminLogin cu stilizare + ruta in `App.jsx` + functionalitati _Laborator 7_ + actualizare ReadMe

[ ✨ 6.11.2025 ] `v6.11` → Adaugare Bcrypt, Tokens + Functionalitati _Laborator 6_ + actualizare ReadMe

[ ✨ 29.10.2025 ] `v29.10` → Adaugare Stripe + Functionalitati _Laborator 5_ + create ReadMe

[ 🐛 29.10.2025 ] `v29.10` → Bugfix filtrare text-input si selector de pret.
