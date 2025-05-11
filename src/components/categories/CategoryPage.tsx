import { useState, useMemo } from "react";
import { useCategories } from "@/components/hooks/useCategories";
import { PageHeader } from "@/components/categories/PageHeader";
import { CategoryList } from "@/components/categories/CategoryList";
import { CategoryFormModal } from "@/components/categories/CategoryFormModal";
import { CategoryFilters } from "@/components/categories/CategoryFilters";
import type { CategoryViewModel, CategoryFormData, CategoryFilter } from "@/types";

export default function CategoryPage() {
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryViewModel | null>(null);

  const {
    categories,
    isLoading,
    error,
    filters,
    setFilters: updateFilters,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) => {
        if (filters.type === "all") return true;
        if (filters.type === "expense") return !cat.is_revenue;
        if (filters.type === "revenue") return cat.is_revenue;
        return true;
      })
      .filter((cat) => {
        if (!filters.search) return true;
        return cat.name.toLowerCase().includes(filters.search.toLowerCase());
      });
  }, [categories, filters]);

  const handleAddCategory = () => {
    setEditingCategory(null);
    setFormModalOpen(true);
  };

  const handleEditCategory = (category: CategoryViewModel) => {
    setEditingCategory(category);
    setFormModalOpen(true);
  };

  const handleDeleteCategory = async (category: CategoryViewModel) => {
    if (window.confirm(`Are you sure you want to delete category "${category.name}"?`)) {
      try {
        await deleteCategory(category.id);
      } catch {}
    }
  };

  // Handle form submission
  const handleFormSubmit = async (data: CategoryFormData) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, { name: data.name });
      } else {
        await createCategory(data);
      }
      setFormModalOpen(false);
    } catch {}
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: CategoryFilter) => {
    updateFilters(newFilters);
  };

  return (
    <div className="container px-6 py-6 space-y-6">
      <PageHeader onAddClick={handleAddCategory} />

      <CategoryFilters filters={filters} onFiltersChange={handleFilterChange} />

      <CategoryList
        categories={filteredCategories}
        isLoading={isLoading}
        error={error}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
        onRetry={fetchCategories}
      />

      <CategoryFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialValues={
          editingCategory ? { name: editingCategory.name, is_revenue: editingCategory.is_revenue } : undefined
        }
        isEditing={!!editingCategory}
      />
    </div>
  );
}
