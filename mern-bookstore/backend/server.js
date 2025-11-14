/**
 * MERN BOOKSTORE E-COMMERCE API v1
 * Server Express.js pentru magazinul online de cărți cu funcționalități complete e-com
 * * * Funcționalități implementate:
 * - Catalog de produse (cărți) cu prețuri și stocuri
 * */

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

// Inițializarea aplicației Express
const app = express();
const PORT = 3000;

// Configurarea middleware-ului de bază
app.use(cors()); // Permite cereri cross-origin de la frontend
app.use(express.json()); // Parser pentru JSON în request body

// Căile către fișierele de date
const PRODUCTS_FILE = path.join(__dirname, "data", "books.json");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { stripTypeScriptTypes } = require("module");
const USERS_FILE = path.join(__dirname, "data", "users.json");

/**
 * =====================================
 * FUNCTII HELPER PENTRU AUTENTIFICARE
 * =====================================
 */

// Read USERS
/**
 * Funcţie helper pentru citirea utilizatorilor din fişierul JSON
 * @returns {Object} Obiect cu array-ul de utilizatori
 */
const readUsers = () => {
   try {
      const data = fs.readFileSync(USERS_FILE, "utf8");
      return JSON.parse(data);
   } catch (error) {
      console.error("Eroare la citirea utilizatorilor:", error);
      // Returnează structură goală dacă fişierul nu există
      return { users: [] };
   }
};

// Authenticate token
const authenticateToken = (req, res, next) => {
   const authHeader = req.headers["authorization"];
   const token = authHeader && authHeader.split(" ")[1];
   if (!token) {
      return res.status(401).json({ success: false, message: "Token required" });
   }

   jwt.verify(token, process.env.JWT_SECRET || "fallback_secret", (err, user) => {
      if (err) {
         return res.status(403).json({ success: false, message: "Token invalid" });
      }
      req.user = user;
      next();
   });
};

// Require Admin

const requireAdmin = (req, res, next) => {
   if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access required" });
   }
   next();
};

/**
 * =====================================
 * FUNCTII HELPER PENTRU GESTIUNEA DATELOR
 * =====================================
 */

/**
 * * Funcție helper pentru citirea produselor din fișierul JSON
 * @returns {Array} Array-ul cu produsele sau array gol în caz de eroare
 */
const readProducts = () => {
   try {
      const data = fs.readFileSync(PRODUCTS_FILE, "utf8");
      const parsedData = JSON.parse(data);
      return parsedData.products || [];
   } catch (error) {
      console.error("Eroare la citirea produselor:", error);
      return [];
   }
};

/**
 * =====================================
 * API ROUTES PENTRU PRODUSE
 * =====================================
 */

/**
 * RUTA GET /api/admin/products Obține toate produsele pentru admin (cu filtre)
 * Parametri interogare:
 *
 * category: filtrare după categorie
 * search: căutare în titlu/autor
 *
 * status: active/inactive (all pentru toate)
 * page: paginare
 *
 * limit: număr produse per pagină
 */
app.get("/api/admin/products", authenticateToken, requireAdmin, (req, res) => {
   try {
      const { category, search, status = "all", page = 1, limit = 50, sortBy = "createdAt", sortOrder = "desc" } = req.query;

      console.log("Filtre administrare produse:", { category, search, status, page, limit });

      let products = readProducts();

      // FILTRARE DUPĂ STATUS
      if (status === "active") {
         products = products.filter((p) => p.isActive === true);
      } else if (status === "inactive") {
         products = products.filter((p) => p.isActive === false);
      }
      // 'all' afişează toate produsele

      // FILTRARE DUPĂ CATEGORIE
      if (category && category !== "all") {
         products = products.filter((p) => p.category.toLowerCase().includes(category.toLowerCase()));
      }

      // CAUTARE ÎN TITLU ȘI AUTOR
      if (search) {
         const searchTerm = search.toLowerCase();
         products = products.filter((p) => p.title.toLowerCase().includes(searchTerm) || p.author.toLowerCase().includes(searchTerm) || (p.isbn && p.isbn.includes(search)));
      }

      // SORTARE
      const sortField = sortBy || "createdAt";
      const order = sortOrder === "asc" ? 1 : -1;

      products.sort((a, b) => {
         if (sortField === "title" || sortField === "author" || sortField === "category") {
            return order * a[sortField].localeCompare(b[sortField]);
         } else if (sortField === "price" || sortField === "stock" || sortField === "rating") {
            return order * (a[sortField] - b[sortField]);
         } else {
            // createdAt sau alte câmpuri de data
            return order * (new Date(a[sortField]) - new Date(b[sortField]));
         }
      });

      // PAGINARE
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedProducts = products.slice(startIndex, endIndex);

      // STATISTICI
      const totalProducts = products.length;
      const activeProducts = products.filter((p) => p.isActive).length;
      const inactiveProducts = products.filter((p) => !p.isActive).length;
      const lowStockProducts = products.filter((p) => p.stock < 10 && p.stock > 0).length;
      const outOfStockProducts = products.filter((p) => p.stock === 0).length;

      res.json({
         success: true,
         products: paginatedProducts,
         pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(totalProducts / limitNum),
            totalProducts,
            productsPerPage: limitNum,
            hasNextPage: endIndex < totalProducts,
            hasPrevPage: startIndex > 0,
         },
         statistics: {
            total: totalProducts,
            active: activeProducts,
            inactive: inactiveProducts,
            lowStock: lowStockProducts,
            outOfStock: outOfStockProducts,
         },
         filters: {
            category: category || "all",
            search: search || "",
            status: status,
            sortBy: sortField,
            sortOrder: sortOrder,
         },
      });
   } catch (error) {
      console.error("Eroare la obținerea produselor admin:", error);
      res.status(500).json({
         success: false,
         message: "Eroare server la obținerea produselor",
      });
   }
});

/**
 * RUTA POST /api/admin/products Adaugă produs nou cu TOATE câmpurile
 */
app.post("/api/admin/products", authenticateToken, requireAdmin, (req, res) => {
   try {
      const { title, author, price, description, imageUrl, category, stock, discountPrice, isbn, publisher, pages, year, rating, reviewCount, tags, featured } = req.body;

      console.log("Date primite pentru produs nou:", req.body);

      // VALIDARI OBLIGATORII
      const requiredFields = ["title", "author", "price", "stock"];
      const missingFields = requiredFields.filter((field) => !req.body[field]);

      if (missingFields.length > 0) {
         return res.status(400).json({
            success: false,
            message: `Câmpuri obligatorii lipsă: ${missingFields.join(", ")}`,
            missingFields,
         });
      }

      // VALIDARI SUPLIMENTARE
      if (price < 0) {
         return res.status(400).json({
            success: false,
            message: "Prețul nu poate fi negativ",
         });
      }
      if (stock < 0) {
         return res.status(400).json({
            success: false,
            message: "Stocul nu poate fi negativ",
         });
      }
      if (discountPrice && discountPrice > price) {
         return res.status(400).json({
            success: false,
            message: "Prețul redus nu poate fi mai mare decât prețul original",
         });
      }

      const products = readProducts();

      // GENERARE ID INCREMENTAT
      const lastProduct = products[products.length - 1];
      const newId = lastProduct ? lastProduct.id + 1 : 1;

      // CREEAZĂ PRODUS NOU CU TOATE CÂMPURILE
      const newProduct = {
         id: newId,
         title: title.trim(),
         author: author.trim(),
         isbn: isbn?.trim() || "",
         category: category?.trim() || "General",
         price: parseFloat(price),
         discountPrice: discountPrice ? parseFloat(discountPrice) : null,
         description: description?.trim() || "",
         imageUrl: imageUrl?.trim() || "/images/default-book.jpg",
         stock: parseInt(stock),
         isActive: true,
         featured: featured || false,
         rating: rating ? parseFloat(rating) : null,
         reviewCount: reviewCount ? parseInt(reviewCount) : 0,
         tags: tags || [],
         specifications: {
            pages: pages?.toString() || "",
            language: "Romanian",
            publisher: publisher?.trim() || "",
            year: year?.toString() || "",
            format: "Paperback",
         },
         createdAt: new Date().toISOString(),
         updatedAt: new Date().toISOString(),
         createdBy: req.user.id,
      };

      // ADAUGĂ PRODUSUL
      products.push(newProduct);

      // SALVEAZĂ ÎN FIŞIER
      const productsData = { products };
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(productsData, null, 2));

      console.log("Produs adăugat cu succes:", newProduct.id);
      res.status(201).json({
         success: true,
         message: "Produs adăugat cu succes",
         product: newProduct,
      });
   } catch (error) {
      console.error("Eroare la adăugarea produsului:", error);
      res.status(500).json({
         success: false,
         message: "Eroare server la adăugarea produsului",
         error: error.message,
      });
   }
});

/**
 * RUTA POST /api/admin/login Login pentru admin
 */
app.post("/api/admin/login", async (req, res) => {
   try {
      const { email, password } = req.body;
      console.log("Încercare login admin:", email);

      if (!email || !password) {
         return res.status(400).json({
            success: false,
            message: "Email și parolă sunt obligatorii",
         });
      }

      const usersData = readUsers();
      const user = usersData.users.find((u) => u.email === email && u.role === "admin");

      if (!user) {
         console.log("Utilizator admin negăsit:", email);
         return res.status(401).json({
            success: false,
            message: "Acces restricționat doar administratori",
         });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
         console.log("Parolă incorectă pentru:", email);
         return res.status(401).json({
            success: false,
            message: "Parolă incorectă",
         });
      }

      const token = jwt.sign(
         {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
         },
         process.env.JWT_SECRET || "fallback_secret",
         { expiresIn: "8h" }
      );

      console.log("Login admin reuşit:", email);
      res.json({
         success: true,
         message: "Autentificare admin reușită",
         token,
         user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
         },
      });
   } catch (error) {
      console.error("Eroare la login admin:", error);
      res.status(500).json({
         success: false,
         message: "Eroare server la autentificare",
      });
   }
});

/**
 * * RUTA GET /api/products - Obține toate produsele active cu opțiuni de filtrare
 * * Parametri de interogare:
 * - category: filtrare după categorie
 */
app.get("/api/products", (req, res) => {
   try {
      let products = readProducts();
      // Filtrare dupa produsele active
      products = products.filter((p) => p.isActive === true);
      // Filtrare după categorie
      if (req.query.category) {
         products = products.filter((p) => p.category.toLowerCase() === req.query.category.toLowerCase());
      }
      //== Căutare după titlu sau autor
      if (req.query.search) {
         const keyword = req.query.search.toLowerCase();
         products = products.filter((p) => p.title.toLowerCase().includes(keyword) || p.author.toLowerCase().includes(keyword));
      }
      //=== Sortare ===
      if (req.query.sort) {
         switch (req.query.sort) {
            case "price_asc":
               products.sort((a, b) => a.price - b.price);
               break;
            case "price_desc":
               products.sort((a, b) => b.price - a.price);
               break;
            case "title_asc":
               products.sort((a, b) => a.title.localeCompare(b.title));
               break;
            case "title_desc":
               products.sort((a, b) => b.title.localeCompare(a.title));
               break;
         }
      }
      res.json({
         success: true,
         products,
         total: products.length,
         filters: {
            category: req.query.category || null,
            search: req.query.search || null,
            sort: req.query.sort || null,
         },
      });
   } catch (error) {
      console.error("Eroare la obținerea produselor:", error);
      res.status(500).json({ success: false, message: "Eroare server" });
   }
});

const stripe = require("stripe")("sk_test_51PTP1qBVnVm4XrsHx8kIS9f9ehjUSrwxC7G00hsFCPwn9k431jUsBvAwm1R0n8sktiVSnQkvYZr2FXODjjEpjH8d00INU6ab6u");

// inainte de app.get('/', (req, res)
/**
 * RUTA POST /api/create-checkout-session
 * creează sesiune Stripe Checkout
 */
app.post("/api/create-checkout-session", async (req, res) => {
   try {
      const { amount, cartItems } = req.body;
      console.log("creează sesiune checkout pentru suma de:", amount);
      // validări
      if (!amount || amount < 1) {
         return res.status(400).json({
            success: false,
            error: "Suma invalidă",
         });
      }
      // creează randuri pentru produse
      const lineItems = [
         ...cartItems.map((item) => ({
            price_data: {
               currency: "ron",
               product_data: {
                  name: item.title,
                  description: `de ${item.author}`,
                  images: [item.imageUrl],
               },
               unit_amount: Math.round(item.price * 100), // preț per unitate
               // deoarece Stripe lucrează în subunități: RON BANI (1 RON = 100 bani)
            },
            quantity: item.quantity,
         })),
         // adaugăm transportul
         {
            price_data: {
               currency: "ron",
               product_data: {
                  name: "Transport",
                  description: "Cost livrare",
               },
               unit_amount: 1999, // 19.99 RON
            },
            quantity: 1,
         },
         //
      ]; // am corectat sintaxa din document

      // creează sesiunea Stripe Checkout
      const session = await stripe.checkout.sessions.create({
         payment_method_types: ["card"],
         line_items: lineItems,
         mode: "payment",
         success_url: `${req.headers.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&clear_cart=true`,
         cancel_url: `${req.headers.origin}/`,
         metadata: {
            order_type: "book_store",
         },
      });

      console.log("Sesiune checkout creată:", session.id);
      res.json({
         success: true,
         sessionId: session.id,
         sessionUrl: session.url,
      });
   } catch (error) {
      console.error("Eroare Stripe:", error);
      res.status(500).json({
         success: false,
         error: "Eroare la crearea sesiunii de plată",
      });
   }
});

app.get("/api/check-payment-status/:sessionId", async (req, res) => {
   try {
      const { sessionId } = req.params;
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      res.json({
         success: true,
         paymentStatus: session.payment_status,
      });
   } catch (error) {
      res.status(500).json({ success: false, error: "Eroare verificare plată" });
   }
});

/**
 * RUTA POST /api/clear-cart Golește coșul
 */
app.post("/api/clear-cart", async (req, res) => {
   try {
      const cart = await readCart();
      // sterge toate produsele din coș
      cart.items = [];
      cart.total = 0;
      cart.totalItems = 0;
      saveCart(cart);
      res.json({
         success: true,
         message: "Coș golit cu succes",
      });
   } catch (error) {
      console.error("Eroare la golirea coșului:", error);
      res.status(500).json({
         success: false,
         message: "Eroare server la golirea coșului",
      });
   }
});

/**
 * * RUTA GET / - Informații despre API
 */
app.get("/", (req, res) => {
   res.json({
      message: "MERN Book Store API v1",
      description: "API simplu pentru catalogul de cărți",
      version: "1.0.0",
      endpoints: ["GET /api/products", "Obține toate produsele active", "GET /api/products?category=books", "Filtrare după categorie books"],
      author: "mSIA21",
   });
});

// Pornirea serverului
if (process.env.NODE_ENV !== "test") {
   app.listen(PORT, () => {
      console.log(`\n MERN Book Store API v1`);
      console.log(` Serverul rulează pe: http://localhost:${PORT} `);
      console.log(` Produse: http://localhost:${PORT}/api/products `);
      console.log(`\n Server pregătit pentru utilizare!`);
   });
}

// Exportă aplicația pentru testare
module.exports = app;

// Testare API endpoint
// curl "http://localhost:3000/api/products" | head -20
// curl "http://localhost:3000/api/products?category=React" | jq '.total'
// curl "http://localhost:3000" | jq
// testarea poate fi realizata si din browser, Thunder Client, Postman

const CART_FILE = path.join(__dirname, "data", "cart.json");

/**
 * Functie helper pentru citirea coşului din fişierul JSON
 * @returns {Object} Obiectul coş sau structură default
 */
const readCart = () => {
   try {
      const data = fs.readFileSync(CART_FILE, "utf8");
      return JSON.parse(data);
   } catch (error) {
      // Returnează coş gol dacă fişierul nu există
      return {
         items: [],
         total: 0,
         totalItems: 0,
         lastUpdated: new Date().toISOString(),
      };
   }
};

/**
 * Funcție helper pentru salvarea coşului în fişierul JSON
 * @param {Object} cart Obiectul coş de salvat
 */
const saveCart = (cart) => {
   try {
      cart.lastUpdated = new Date().toISOString();
      fs.writeFileSync(CART_FILE, JSON.stringify(cart, null, 2));
   } catch (error) {
      console.error("Eroare la salvarea coşului:", error);
      throw error;
   }
};
/**
 * RUTA POST /api/cart
 * Adaugă un produs în coş
 * Body: { productId, quantity }
 */
app.post("/api/cart", (req, res) => {
   try {
      const { productId, quantity = 1 } = req.body;

      if (!productId) {
         return res.status(400).json({
            success: false,
            message: "ID produs este obligatoriu",
         });
      }

      // Citește produsele pentru a verifica existenţa
      const products = readProducts();
      const product = products.find((p) => p.id === productId && p.isActive === true);

      if (!product) {
         return res.status(404).json({
            success: false,
            message: "Produsul nu a fost găsit",
         });
      }

      if (product.stock < quantity) {
         return res.status(400).json({
            success: false,
            message: "Stoc insuficient",
         });
      }

      // Citește coşul existent sau creează unul nou
      const cart = readCart();

      // Verifică dacă produsul există deja în coş
      const existingItemIndex = cart.items.findIndex((item) => item.productId === productId);

      if (existingItemIndex > -1) {
         // Actualizează cantitatea
         cart.items[existingItemIndex].quantity += quantity;
      } else {
         // Adaugă produs nou în coş
         cart.items.push({
            productId,
            quantity,
            title: product.title,
            author: product.author,
            price: product.discountPrice || product.price,
            imageUrl: product.imageUrl,
            addedAt: new Date().toISOString(),
         });
      }

      // Recalculează totalul
      cart.total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

      // Salvează coşul actualizat
      saveCart(cart);

      res.json({
         success: true,
         message: "Produs adăugat în coş",
         cart: cart,
      });
   } catch (error) {
      console.error("Eroare la adăugarea în coș:", error);
      res.status(500).json({
         success: false,
         message: "Eroare server la adăugarea în coş",
      });
   }
});

// inainte de app.get('/', (req, res)
/**
 * RUTA POST /api/create-checkout-session
 * creează sesiune Stripe Checkout
 */
app.post("/api/create-checkout-session", async (req, res) => {
   try {
      const { amount, cartItems } = req.body;
      console.log("creează sesiune checkout pentru suma de:", amount);
      // validări
      if (!amount || amount < 1) {
         return res.status(400).json({
            success: false,
            error: "Suma invalidă",
         });
      }
      // creează randuri pentru produse
      const lineItems = [
         ...cartItems.map((item) => ({
            price_data: {
               currency: "ron",
               product_data: {
                  name: item.title,
                  description: `de ${item.author}`,
                  images: [item.imageUrl],
               },
               unit_amount: Math.round(item.price * 100), // preț per unitate
               // deoarece Stripe lucrează în subunități: RON BANI (1 RON = 100 bani)
            },
            quantity: item.quantity,
         })),
         // adaugăm transportul
         {
            price_data: {
               currency: "ron",
               product_data: {
                  name: "Transport",
                  description: "Cost livrare",
               },
               unit_amount: 1999, // 19.99 RON
            },
            quantity: 1,
         },
         //
      ]; // am corectat sintaxa din document

      // creează sesiunea Stripe Checkout
      const session = await stripe.checkout.sessions.create({
         payment_method_types: ["card"],
         line_items: lineItems,
         mode: "payment",
         success_url: `${req.headers.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&clear_cart=true`,
         cancel_url: `${req.headers.origin}/`,
         metadata: {
            order_type: "book_store",
         },
      });

      console.log("Sesiune checkout creată:", session.id);
      res.json({
         success: true,
         sessionId: session.id,
         sessionUrl: session.url,
      });
   } catch (error) {
      console.error("Eroare Stripe:", error);
      res.status(500).json({
         success: false,
         error: "Eroare la crearea sesiunii de plată",
      });
   }
});

/**
 * RUTA GET /api/cart Obține conținutul coşului
 */
app.get("/api/cart", (req, res) => {
   try {
      const cart = readCart();
      res.json({
         success: true,
         cart: cart,
      });
   } catch (error) {
      console.error("Eroare la obținerea coşului:", error);
      res.status(500).json({
         success: false,
         message: "Eroare server la obținerea coșului",
      });
   }
});

/**
 * RUTA DELETE /api/cart/:productId
 * Sterge un produs din coș
 */
app.delete("/api/cart/:productId", (req, res) => {
   try {
      const { productId } = req.params;
      const cart = readCart();

      // Convertim productId la number
      const productIdNum = Number(productId);

      // Filtrează cartile din cos, eliminând pe cel cu productId-ul dorit
      cart.items = cart.items.filter((item) => item.productId !== productIdNum);

      // Recalculează totalul
      cart.total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

      saveCart(cart);

      res.json({
         success: true,
         message: "Produs șters din coş",
         cart: cart,
      });
   } catch (error) {
      console.error("Eroare la ştergerea din coș:", error);
      res.status(500).json({
         success: false,
         message: "Eroare server la ştergerea din coş",
      });
   }
});

/**
 * RUTA PUT/api/admin/products/:id Actualizează produs
 */
app.put("/api/admin/products/:id", authenticateToken, requireAdmin, (req, res) => {
   try {
      const productId = parseInt(req.params.id);
      const updates = req.body;
      let products = readProducts();
      const productIndex = products.findIndex((p) => p.id === productId);

      if (productIndex === -1) {
         return res.status(404).json({
            success: false,
            message: "Produsul nu a fost găsit",
         });
      }

      // Actualizează produsul
      products[productIndex] = {
         ...products[productIndex],
         ...updates,
         updatedAt: new Date().toISOString(),
      };

      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify({ products }, null, 2));

      res.json({
         success: true,
         message: "Produs actualizat cu succes",
         product: products[productIndex],
      });
   } catch (error) {
      console.error("Eroare la actualizarea produsului:", error);
      res.status(500).json({
         success: false,
         message: "Eroare server la actualizarea produsului",
      });
   }
});
/**
 * RUTA DELETE /api/admin/products/:id Şterge sau dezactivează produs
 */
app.delete("/api/admin/products/:id", authenticateToken, requireAdmin, (req, res) => {
   try {
      const productId = parseInt(req.params.id);
      const { permanent = false } = req.query; // soft delete vs hard delete
      let products = readProducts();
      const productIndex = products.findIndex((p) => p.id === productId);

      if (productIndex === -1) {
         return res.status(404).json({
            success: false,
            message: "Produsul nu a fost găsit",
         });
      }

      let message;

      if (permanent) {
         // Stergere permanentă
         products.splice(productIndex, 1);
         message = "Produs şters definitiv";
      } else {
         // Soft delete (dezactivează)
         products[productIndex].isActive = false;
         products[productIndex].updatedAt = new Date().toISOString();
         message = "Produs dezactivat cu succes";
      }

      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify({ products }, null, 2));

      res.json({
         success: true,
         message,
      });
   } catch (error) {
      console.error("Eroare la ștergerea produsului:", error);
      res.status(500).json({
         success: false,
         message: "Eroare server la ștergerea produsului",
      });
   }
});

/**
 * RUTA GET /api/admin/products/:id Obține un singur produs
 */
app.get("/api/admin/products/:id", authenticateToken, requireAdmin, (req, res) => {
   try {
      const productId = parseInt(req.params.id);
      const products = readProducts();
      const product = products.find((p) => p.id === productId);

      if (!product) {
         return res.status(404).json({
            success: false,
            message: "Produsul nu a fost găsit",
         });
      }

      res.json({
         success: true,
         product,
      });
   } catch (error) {
      console.error("Eroare la obținerea produsului:", error);
      res.status(500).json({
         success: false,
         message: "Eroare server la obținerea produsului",
      });
   }
});
