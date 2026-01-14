import React from 'react';
import { Card, CardContent, CardFooter } from '../card';
import { StatusBadge } from '../StatusBadge/StatusBadge';
import { cn } from '@/lib/utils';

export interface ItemCardProps {
  title: string;
  description?: string;
  image?: string;
  status?: string;
  className?: string;
  location?: string;
  date?: string;
  category?: string;
  onClick?: () => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ 
  title, 
  description, 
  image, 
  status, 
  className = '',
  location,
  date,
  category,
  onClick
}) => {
  return (
    <Card 
      className={cn(
        "overflow-hidden border-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 rounded-3xl cursor-pointer group",
        className
      )}
      onClick={onClick}
    >
      <div className="relative aspect-video overflow-hidden">
        {image ? (
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
            No image available
          </div>
        )}
        {status && (
          <div className="absolute top-4 right-4">
            <StatusBadge status={status} className="shadow-lg" />
          </div>
        )}
        {category && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-bold rounded-full shadow-sm">
              {category}
            </span>
          </div>
        )}
      </div>
      
      <CardContent className="p-5">
        <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
          {title}
        </h3>
        {description && (
          <p className="text-slate-600 mt-2 text-sm line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}
      </CardContent>

      {(location || date) && (
        <CardFooter className="px-5 py-4 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-tight">
          <div className="flex items-center gap-1.5">
            {location && <span>{location}</span>}
          </div>
          {date && <span>{date}</span>}
        </CardFooter>
      )}
    </Card>
  );
};

export default ItemCard;