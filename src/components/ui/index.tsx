export { default as Logo } from "./Logo/Logo";

// Shadcn UI Components (Enhanced Primitives)
export { buttonVariants } from "./button";
export { Input as ShadcnInput } from "./input";
export { Card as ShadcnCard, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./card";
export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "./dialog";
export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "./sheet";
export { 
  Select as ShadcnSelect, 
  SelectGroup, 
  SelectValue, 
  SelectTrigger, 
  SelectContent, 
  SelectLabel, 
  SelectItem, 
  SelectSeparator, 
  SelectScrollUpButton, 
  SelectScrollDownButton 
} from "./select";
export { Skeleton } from "./skeleton";
export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from "./table";
export { Tabs, TabsList, TabsTrigger, TabsContent, TabList, TabTrigger, TabContent } from "./tabs";
export { Badge as ShadcnBadge } from "./badge";
export { ScrollArea, ScrollBar } from "./scroll-area";
export { Switch } from "./switch";

// Compatibility Shims (The ones used throughout the app)
export { Button } from "./Button/Button";
export type { ButtonProps } from "./Button/Button";

export { Input } from "./Input/Input";
export type { InputProps } from "./Input/Input";

export { Textarea } from "./Textarea/Textarea";
export type { TextareaProps } from "./Textarea/Textarea";

export { Modal, ModalHeader, ModalBody, ModalFooter } from "./Modal/Modal";
export type { ModalProps } from "./Modal/Modal";

export { Select } from "./Select/Select";
export type { SelectProps, SelectOption } from "./Select/Select";

export { Alert } from "./Alert/Alert";
export { AlertTitle, AlertDescription } from "./alert";
export type { AlertProps } from "./Alert/Alert";

export { Card } from "./Card/Card";
export type { CardProps } from "./Card/Card";

export { Badge } from "./badge"; // This is standardized now

export { StatusBadge } from "./StatusBadge/StatusBadge";
export type { StatusBadgeProps } from "./StatusBadge/StatusBadge";

export { Grid } from "./Grid/Grid";
export type { GridProps } from "./Grid/Grid";

export { Container } from "./Container/Container";
export type { ContainerProps } from "./Container/Container";

export { Spinner } from "./Spinner/Spinner";
export { default as StatsCard } from "./StatsCard/StatsCard";
export { default as ItemCard } from "./ItemCard/ItemCard";
export { Timeline } from "./Timeline/Timeline";
export { Menu } from "./Menu/Menu";
export type { MenuRef, MenuItem } from "./Menu/Menu";
export { Menubar } from "./Menubar/Menubar";
export { Avatar } from "./Avatar/Avatar";
export { default as Toast } from "./Toast/Toast";
export type { ToastRef, ToastMessage } from "./Toast/Toast";
export { ProgressBar } from "./ProgressBar/ProgressBar";
export { ImageGallery } from "./ImageGallery/ImageGallery";

// Re-export common icon-related components if needed

