"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ConfirmDeleteDialogProps {
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  triggerClassName?: string;
}

export function ConfirmDeleteDialog({
  onConfirm,
  title = "Potwierdzenie usuwania",
  description = "Na pewno chcesz usunac? Tej operacji nie mozna cofnac.",
  triggerClassName = "h-7 w-7 text-muted-foreground/40 hover:text-destructive",
}: ConfirmDeleteDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className={triggerClassName}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Anuluj</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm()}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Usun
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
