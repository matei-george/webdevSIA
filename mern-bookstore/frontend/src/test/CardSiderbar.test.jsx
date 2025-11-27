import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CardSidebar from "../components/CardSidebar";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";

// Simulare axios
vi.mock("axios");

describe("CardSidebar Functionalitati Cos Cumparaturi", () => {
   const mockCartItems = [
      {
         productId: 101,
         title: "MongoDB: The Definitive Guide",
         author: "Shannon Bradshaw",
         price: 39.99,
         quantity: 2,
         imageUrl: "test-image.jpg",
      },
   ];

   const mockCart = {
      items: mockCartItems,
      total: 79.98,
      totalItems: 2,
   };

   // Taxa adăugată în componenta CardSidebar este 19.99
   const EXPECTED_CHECKOUT_TOTAL = (mockCart.total + 19.99).toFixed(2); // 99.97
   const EXPECTED_CHECKOUT_TEXT = `Finalizează comanda ${EXPECTED_CHECKOUT_TOTAL} RON`;

   const mockOnClose = vi.fn();
   const mockCartResponse = {
      data: { success: true, cart: mockCart },
   };

   const mockEmptyCartResponse = {
      data: {
         success: true,
         cart: { items: [], total: 0, totalItems: 0 },
      },
   };

   beforeEach(() => {
      vi.clearAllMocks();
      // Simulează fetch global pentru checkout
      global.fetch = vi.fn();
      global.alert = vi.fn();
   });

   const renderComponent = (isOpen = true) => {
      return render(
         <BrowserRouter>
            <CardSidebar isopen={isOpen} onClose={mockOnClose} />
         </BrowserRouter>
      );
   };

   // Teste de bază
   it("nu ar trebui să fie vizibil când isOpen este false", () => {
      renderComponent(false);
      expect(screen.queryByText("Coșul de cumpărături")).not.toBeInTheDocument();
   });

   it("ar trebui să afișeze coșul cu produse când este deschis", async () => {
      axios.get.mockResolvedValueOnce(mockCartResponse);
      renderComponent(true);

      await screen.findByText("Coșul de cumpărături");

      expect(screen.getByText("MongoDB: The Definitive Guide")).toBeInTheDocument();
      expect(screen.getByText("de Shannon Bradshaw")).toBeInTheDocument();
   });

   it("ar trebui să afișeze coșul gol corect", async () => {
      axios.get.mockResolvedValueOnce(mockEmptyCartResponse);
      renderComponent(true);

      await screen.findByText("Coșul tău este gol");

      expect(screen.getByText("Adaugă produse din catalog")).toBeInTheDocument();
   });

   it("ar trebui să afișeze totalurile corecte", async () => {
      axios.get.mockResolvedValueOnce(mockCartResponse);
      renderComponent(true);

      await screen.findByText("Total produse: 2");

      expect(screen.getByText(/79.98 RON/)).toBeInTheDocument();
   });

   it("ar trebui să închidă sidebar-ul la click pe overlay", async () => {
      axios.get.mockResolvedValueOnce(mockCartResponse);
      renderComponent(true);

      await runTimers();

      await waitFor(() => {
         expect(screen.getByText("Coșul de cumpărături")).toBeInTheDocument();
      });

      const overlay = document.querySelector(".card-sidebar-overlay");
      fireEvent.click(overlay);
      expect(mockOnClose).toHaveBeenCalled();
   });

   it("ar trebui să închidă sidebar-ul la click pe butonul de închidere", async () => {
      axios.get.mockResolvedValueOnce(mockCartResponse);
      renderComponent(true);

      await screen.findByText("Coșul de cumpărături");

      const closeButton = screen.getByText("x");
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalled();
   });

   it("ar trebui să afișeze butonul de checkout cu prețul corect", async () => {
      axios.get.mockResolvedValueOnce(mockCartResponse);
      renderComponent(true);

      // Așteaptă 99.97 RON (79.98 + 19.99 taxă)
      await screen.findByText(EXPECTED_CHECKOUT_TEXT);
   });

   it("ar trebui să gestioneze checkout-ul cu succes fără erori", async () => {
      axios.get.mockResolvedValueOnce(mockCartResponse);

      // Simulare pentru checkout cu succes
      global.fetch.mockResolvedValueOnce({
         ok: true,
         json: async () => ({ success: true, sessionUrl: "https://checkout.stripe.com/session_123" }),
      });

      // Simulare pentru window.location pentru a evita erori de navigare
      const originalLocation = window.location;
      delete window.location;
      window.location = { href: "" };

      renderComponent(true);

      const checkoutButton = await screen.findByText(EXPECTED_CHECKOUT_TEXT);

      fireEvent.click(checkoutButton);

      await waitFor(() => {
         expect(global.fetch).toHaveBeenCalled();
      });

      // Restaureaza window.location
      window.location = originalLocation;
   });

   // Test simplificat pentru butonul de ștergere doar verifică că există
   it("ar trebui să afișeze butoanele de stergere pentru produse", async () => {
      axios.get.mockResolvedValueOnce(mockCartResponse);
      renderComponent(true);

      await screen.findByText("MongoDB: The Definitive Guide");

      // CORECȚIE Text/Regex: Folosim Regex flexibil pentru "Şterge" vs "Sterge"
      expect(screen.getByText(/Şterge|Sterge/i)).toBeInTheDocument();
   });

   it("ar trebui să afișeze informațiile complete ale produselor", async () => {
      axios.get.mockResolvedValueOnce(mockCartResponse);
      renderComponent(true);

      await screen.findByText("MongoDB: The Definitive Guide");

      expect(screen.getByText("de Shannon Bradshaw")).toBeInTheDocument();
      // Verifică formatul exact "39.99RON" (fără spațiu)
      expect(screen.getByText("39.99RON")).toBeInTheDocument();
      expect(screen.getByText("x 2")).toBeInTheDocument();
   });

   it("ar trebui să afișeze butonul de checkout enabled inițial", async () => {
      axios.get.mockResolvedValueOnce(mockCartResponse);
      renderComponent(true);

      await screen.findByText(EXPECTED_CHECKOUT_TEXT);

      const checkoutButton = screen.getByText(EXPECTED_CHECKOUT_TEXT);
      expect(checkoutButton).not.toBeDisabled();
   });
});
