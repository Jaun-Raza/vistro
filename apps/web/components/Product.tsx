import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductProps {
  id: string;
  title: string;
  subtitle?: string;
  price: string;
  currency?: string;
  images: string[];
  tags?: string[];
  badgeText?: string;
}

const ProductCard = ({
  id,
  title,
  subtitle,
  price,
  currency = "£",
  images,
  tags = [],
  badgeText,
}: ProductProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  return (
    <a href={"/product/" + id}>
      <Card className="w-full max-w-full bg-transparent rounded-2xl overflow-hidden text-black shadow-md hover:shadow-xl transition-shadow duration-300 border-none">
        <div className="relative bg-blue-50">
          {badgeText && (
            <div className="absolute top-2 left-2 z-10 bg-transparent text-white font-medium px-2 py-1 rounded-md text-sm border-2 border-white shadow-md backdrop-blur-sm">
              {badgeText}
            </div>

          )}

          <div className="relative aspect-w-16 aspect-h-9 h-48">
            <img
              src={images[currentImageIndex]}
              alt={`${title} - Image ${currentImageIndex + 1}`}
              className="object-fit w-full h-full"
            />
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow-md hover:bg-white"
              >
                <ChevronLeft size={20} className="text-black cursor-pointer" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow-md hover:bg-white"
              >
                <ChevronRight size={20} className="text-black cursor-pointer" />
              </button>
            </>
          )}
        </div>

        <CardHeader className="px-4 pb-0">
          <h3 className="text-white font-bold text-2xl text-left">{title}</h3>
          {subtitle && <p className="text-slg text-gray-300 text-left">{subtitle}</p>}
        </CardHeader>

        <CardContent className="px-4 space-y-2">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag, index) => (
                <Badge
                  key={`${id}-tag-${index}`}
                  variant="outline"
                  className="bg-blue-100 text-black border-blue-200 text-sm"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

        </CardContent>

        <CardFooter className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-end gap-2">
            <span className="text-xl font-bold text-white">
              {currency}{price}
            </span>
          </div>
        </CardFooter>
      </Card>
    </a>
  );
};

export default ProductCard;