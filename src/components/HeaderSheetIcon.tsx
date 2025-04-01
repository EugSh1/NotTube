import Link from "next/link";
import { SheetClose } from "./ui/sheet";
import { LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface IButtonProps {
    title: string;
    variant: "button";
    onClickFn: () => void;
    icon: LucideIcon;
}

interface ILinkProps {
    title: string;
    variant: "link";
    url: string;
    icon: LucideIcon;
}

type IProps = IButtonProps | ILinkProps;

export default function HeaderSheetIcon(props: IProps) {
    const pathname = usePathname();
    const { title, variant, icon: Icon } = props;

    const baseStyles = "flex items-center gap-3.5 hover:bg-secondary/70 p-2 rounded-md transition";

    return (
        <>
            {variant === "link" ? (
                <SheetClose asChild>
                    <Link
                        href={props.url}
                        className={cn(baseStyles, props.url === pathname && "bg-accent/70")}
                    >
                        <Icon className="text-foreground" />
                        <span className="text-foreground">{title}</span>
                    </Link>
                </SheetClose>
            ) : (
                <SheetClose asChild>
                    <button
                        onClick={props.onClickFn}
                        className={cn(baseStyles, "cursor-pointer outline-none w-full")}
                    >
                        <Icon className="text-foreground" />
                        <span className="text-foreground">{title}</span>
                    </button>
                </SheetClose>
            )}
        </>
    );
}
