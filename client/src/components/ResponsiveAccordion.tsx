import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ResponsiveTypography from "@/components/ResponsiveTypography";

interface AccordionItemProps {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface ResponsiveAccordionProps {
  items: AccordionItemProps[];
  type?: "single" | "multiple";
  defaultValue?: string | string[];
  className?: string;
}

export default function ResponsiveAccordion({ 
  items,
  type = "single",
  defaultValue,
  className = ""
}: ResponsiveAccordionProps) {
  return (
    <Accordion 
      type={type} 
      defaultValue={defaultValue}
      className={className}
    >
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id}>
          <AccordionTrigger className="text-sm sm:text-base">
            <ResponsiveTypography variant="h4">
              {item.title}
            </ResponsiveTypography>
          </AccordionTrigger>
          <AccordionContent className="text-xs sm:text-sm">
            {item.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}