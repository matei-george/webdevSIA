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
