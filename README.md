# MERN Bookstore

Aplicatie MERN Bookstore laborator SIA Grupa 1.

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

Acum, in `v14.11` a fost implementat complet sistemul de login incluse cu rute de testare pentru backend. Pentru a face acest lucru, trebuie sa ne folosim de extensia **Thunder Client**, care se descarca de pe _Extensions Store_.

#### Cum folosim Thunder Client?

Dupa ce il instalam din Extensions Store, ne asiguram in primul rand ca backend-ul este pornit. Apasam apoi pe `New Request`. In noul tab deschis introducem URL-ul de request, tipul de request, iar in cazul in care trebuie trimise date, vor fi completate ulterior la seciunea de `Body` .

❗ Inainte de a procesa un request, trebuie obligatoriu sa avem primit token-ul de administrator. Comanda 1 va fi rulata prima de fiecare data, iar apoi token-ul generat va fi plasat in sectiunea de `Authentication` a fiecarui request. In caz contrar, vom primi inapoi `403`.

#### Request-uri Thunder Client

| Nr. | Tip    | Nume                     | URL                                                                         |
| --- | ------ | ------------------------ | --------------------------------------------------------------------------- |
| 1   | `POST` | Admin Login              | `localhost:3000/api/admin/login`                                            |
| 2   | `POST` | Creaza o noua carte      | `localhost:3000/api/admin/products`                                         |
| 3   | `GET`  | Toate produsele          | `localhost:3000/api/admin/products`                                         |
| 4   | `GET`  | Doar produsele active    | `localhost:3000/api/admin/products?status=active`                           |
| 5   | `GET`  | Doar produsele inactive  | `localhost:3000/api/admin/products?status=inactive`                         |
| 6   | `GET`  | Cautare dupa titlu/autor | `localhost:3000/api/admin/products?search=react`                            |
| 7   | `GET`  | Sortare dupa pret        | `localhost:3000/api/admin/products?sortBy=price`                            |
| 8   | `GET`  | Combinatie de filtre     | `localhost:3000/api/admin/products?status=active&search=React&sortBy=price` |
| 9   | `GET`  | Un produs specific       | `localhost:3000/api/admin/products/2`                                       |
| 10  | `PUT`  | Modificare produs        | `localhost:3000/api/admin/products/9`                                       |
| 11  | `DEL`  | Soft Delete              | `localhost:3000/api/admin/products/1`                                       |
| 12  | `DEL`  | Permanent Delete         | `localhost:3000/api/admin/products/1?permanent=true`                        |

---

## 💻 Administrator

In `v13.11` a fost adaugata functionalitatea de logare pe post de _administrator_ cu rutele in `App.jsx`.

Pentru a ne conecta la panelul de administrator folosim url-ul:

`http://localhost:5173/admin/login`

unde introducem credentialele necesare (email + parola).

In `v20.11` a fost adaugat panoul complet de administrare al produselor, care este o ruta automata dupa login catre

`http://localhost:5173/admin/products`

---

## 🏗 Changelog

[ ✨ 20.11.2025 ] `v20.11` → Adaugare AdminProductPanel + rute + actualizare ReadMe

[ ✨ 14.11.2025 ] `v14.11` → Actualizare rute produse + mici imbunatatiri + actualizare ReadMe

[ ✨ 13.11.2025 ] `v13.11` → Adaugare AdminLogin cu stilizare + ruta in `App.jsx` + functionalitati _Laborator 7_ + actualizare ReadMe

[ ✨ 6.11.2025 ] `v6.11` → Adaugare Bcrypt, Tokens + Functionalitati _Laborator 6_ + actualizare ReadMe

[ ✨ 29.10.2025 ] `v29.10` → Adaugare Stripe + Functionalitati _Laborator 5_ + create ReadMe

[ 🐛 29.10.2025 ] `v29.10` → Bugfix filtrare text-input si selector de pret.
