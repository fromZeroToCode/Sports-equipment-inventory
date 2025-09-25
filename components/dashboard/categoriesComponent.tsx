import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash, Search } from "lucide-react";

import {
    getCategories,
    deleteCategory,
} from "@/utils/manipulateData";

import { Category } from "@/utils/types";
import CategoriesForm from "@/components/dashboard/categoriesComponentForm/categoriesForm";

export default function CategoriesComponent() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [filteredCategories, setFilteredCategories] = useState<Category[]>(
        []
    );
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(
        null
    );

    // search + pagination
    const [searchTerm, setSearchTerm] = useState("");
    const PAGE_SIZE = 11;
    const [page, setPage] = useState(1);
    const totalPages = Math.max(
        1,
        Math.ceil(filteredCategories.length / PAGE_SIZE)
    );

    const pagedCategories = filteredCategories.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    const loadCategories = () => {
        const loaded = getCategories();
        setCategories(loaded);
    };

    // Handle edit category
    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setIsFormOpen(true);
    };

    // Handle delete category
    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this category?")) {
            deleteCategory(id);
            loadCategories();
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    // apply search and reset page when search or categories change
    useEffect(() => {
        const term = searchTerm.trim().toLowerCase();
        let result = categories.slice();

        if (term) {
            result = result.filter(
                (c) =>
                    c.name.toLowerCase().includes(term) ||
                    (c.description || "").toLowerCase().includes(term)
            );
        }

        setFilteredCategories(result);
        setPage(1);
    }, [categories, searchTerm]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Categories</h1>

                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            aria-label="Search categories"
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                        />
                    </div>

                    <button
                        onClick={() => {
                            setEditingCategory(null);
                            setIsFormOpen(true);
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Category
                    </button>
                </div>
            </div>

            {/* Category Form */}
            {isFormOpen && (
                <CategoriesForm
                    editingCategory={editingCategory}
                    onClose={() => {
                        setIsFormOpen(false);
                        setEditingCategory(null);
                    }}
                    onSaved={() => {
                        loadCategories();
                    }}
                />
            )}

            {/* Categories List */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Name
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Description
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {pagedCategories.length > 0 ? (
                            pagedCategories.map((category) => (
                                <tr key={category.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {category.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-500">
                                            {category.description}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() =>
                                                    handleEdit(category)
                                                }
                                                className="text-blue-600 hover:text-blue-900"
                                                aria-label={`Edit ${category.name}`}
                                                title={`Edit ${category.name}`}
                                            >
                                                <Edit className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(category.id)
                                                }
                                                className="text-red-600 hover:text-red-900"
                                                aria-label={`Delete ${category.name}`}
                                                title={`Delete ${category.name}`}
                                            >
                                                <Trash className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={3}
                                    className="px-6 py-4 text-center text-sm text-gray-500"
                                >
                                    No categories found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination controls */}
                <div className="px-4 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        Showing{" "}
                        <span className="font-medium">
                            {filteredCategories.length === 0
                                ? 0
                                : (page - 1) * PAGE_SIZE + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium">
                            {Math.min(
                                page * PAGE_SIZE,
                                filteredCategories.length
                            )}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium">
                            {filteredCategories.length}
                        </span>{" "}
                        results
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1 rounded-md border text-sm bg-white disabled:opacity-50"
                        >
                            Previous
                        </button>

                        {/* simple page indicator */}
                        <div className="text-sm text-gray-700">
                            Page <span className="font-medium">{page}</span> of{" "}
                            <span className="font-medium">{totalPages}</span>
                        </div>

                        <button
                            onClick={() =>
                                setPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={page === totalPages}
                            className="px-3 py-1 rounded-md border text-sm bg-white disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
