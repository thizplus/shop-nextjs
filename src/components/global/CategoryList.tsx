import React from 'react';



interface CategoryListProps {
  categories: { catId: string; name: string; }[]; // ใช้ตาม ICategory
  selectedCategory: string;
  onCategoryChange: (event: { target: { value: string } }) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  selectedCategory,
  onCategoryChange
}) => {
  return (
    <div className="w-full mb-4 relative">
      <div className="overflow-x-auto flex gap-6 py-2 px-4 scrollbar-hide">
        <p
          onClick={() => onCategoryChange({ target: { value: '' } })}
          className={`whitespace-nowrap hover:opacity-70 transition-opacity
            ${selectedCategory === '' ? 'border-b-2 border-black font-medium' : ''}`}
        >
          ทั้งหมด
        </p>
        {categories.map((category) => (
          <p
            key={category.catId} // เปลี่ยนจาก id เป็น catId
            onClick={() => onCategoryChange({ target: { value: category.catId } })}
            className={`whitespace-nowrap hover:opacity-70 transition-opacity
      ${selectedCategory === category.catId ? 'border-b-2 border-black font-medium' : ''}`}
          >
            {category.name}
          </p>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;
