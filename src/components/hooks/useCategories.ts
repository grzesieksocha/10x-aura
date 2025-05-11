import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { CategoryResponseDTO, CategoryViewModel, CategoryFormData, CategoryFilter } from "@/types";

const mapToCategoryViewModel = (category: CategoryResponseDTO): CategoryViewModel => {
  return {
    ...category,
  };
};

export function useCategories() {
  const [categories, setCategories] = useState<CategoryViewModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<CategoryFilter>({ type: "all" });

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/categories");

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch categories");
      }

      const data: CategoryResponseDTO[] = await response.json();
      setCategories(data.map(mapToCategoryViewModel));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      toast.error("Nie udało się pobrać kategorii");
    } finally {
      setIsLoading(false);
    }
  }

  async function createCategory(data: CategoryFormData) {
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create category");
      }

      const newCategory: CategoryResponseDTO = await response.json();
      await fetchCategories(); // Refresh the categories list

      toast.success("Kategoria została dodana");
      return newCategory;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nie udało się utworzyć kategorii");
      throw err;
    }
  }

  async function updateCategory(id: number, data: { name: string }) {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update category");
      }

      const updatedCategory: CategoryResponseDTO = await response.json();
      await fetchCategories(); // Refresh the categories list

      toast.success("Kategoria została zaktualizowana");
      return updatedCategory;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nie udało się zaktualizować kategorii");
      throw err;
    }
  }

  async function deleteCategory(id: number) {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete category");
      }

      await fetchCategories();
      toast.success("Kategoria została usunięta");
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nie udało się usunąć kategorii");
      throw err;
    }
  }

  return {
    categories,
    isLoading,
    error,
    filters,
    setFilters,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
