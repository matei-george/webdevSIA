import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import BookCatalog from "../components/BookCatalog";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";

// Simulare axios
vi.mock("axios");

describe("BookCatalog Functionalitati de baza", () => {
   // Date de test comune
   const mockProduct = {
      id: 1,
      title: "Test Book",
      author: "Test Author",
      price: 39.99,
      description: "Test description",
      category: "Test",
      imageUrl: "test.jpg",
      stock: 25,
      specifications: { publisher: "Test", pages: 100, year: 2023 },
   };

   const mockCartResponse = { data: { success: true, cart: { totalItems: 0 } } };
   let consoleErrorMock;

   beforeEach(() => {
      vi.clearAllMocks();
      // Setup toate testele
      axios.get.mockResolvedValue(mockCartResponse);
      // Previne log-urile de eroare în timpul testelor
      consoleErrorMock = vi.spyOn(console, "error").mockImplementation(() => {});
   });

   afterEach(() => {
      consoleErrorMock.mockRestore();
   });

   const renderComponent = () =>
      render(
         <BrowserRouter>
            <BookCatalog />
         </BrowserRouter>
      );

   it("incarca si afiseaza produsele", async () => {
      axios.get.mockResolvedValueOnce({ data: { success: true, products: [mockProduct] } });
      renderComponent();
      expect(screen.getByText("Se încarcă produsele...")).toBeInTheDocument();
      await waitFor(() => {
         expect(screen.getByText("Test Book")).toBeInTheDocument();
      });
   });

   it("afiseaza interfata de cautare", async () => {
      axios.get.mockResolvedValueOnce({ data: { success: true, products: [mockProduct] } });
      renderComponent();
      await waitFor(() => {
         expect(screen.getByText("Test Book")).toBeInTheDocument();
         expect(screen.getByPlaceholderText(/titlu, autor, descriere/i)).toBeInTheDocument();
      });
   });

   it("afiseaza mesaj pentru coș gol", async () => {
      axios.get.mockResolvedValueOnce({ data: { success: true, products: [] } });
      renderComponent();
      await waitFor(() => {
         expect(screen.getByText("Nu sunt produse disponibile")).toBeInTheDocument();
      });
   });

   it("gestioneaza erori API", async () => {
      axios.get.mockRejectedValueOnce(new Error("API Error"));
      renderComponent();
      await waitFor(() => {
         expect(screen.getByText("Eroare la încărcarea produselor")).toBeInTheDocument();
      });
      // Verifică că componenta a încercat să logheze eroarea
      expect(consoleErrorMock).toHaveBeenCalledWith("Eroare la obținerea produselor:", expect.any(Error));
   });

   it("afiseaza loading initial", async () => {
      let resolve;
      const promise = new Promise((r) => {
         resolve = r;
      });
      axios.get.mockReturnValueOnce(promise);
      renderComponent();
      expect(screen.getByText("Se încarcă produsele...")).toBeInTheDocument();
      resolve({ data: { success: true, products: [mockProduct] } });
      await waitFor(() => {
         expect(screen.getByText("Test Book")).toBeInTheDocument();
      });
   });
});
