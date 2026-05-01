import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReviewSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import StarRating from "./StarRating";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface ReviewFormProps {
  userId: string;
  projectId?: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ userId, projectId, onSuccess }: ReviewFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(insertReviewSchema),
    defaultValues: {
      rating: 5,
      comment: "",
      revieweeId: userId,
      projectId: projectId || null,
      isPublic: true
    }
  });

  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      await api.createUserReview(userId, values);
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!"
      });
      onSuccess?.();
      form.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <FormControl>
                <div className="pt-2">
                  <StarRating 
                    rating={field.value} 
                    onRatingChange={field.onChange}
                    size={32}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comment</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Tell us about your experience working with this crew member..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
      </form>
    </Form>
  );
}
