import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { contactService } from '../mocks/contactService';
import type { ContactResponse } from '../mocks/contactService';
import { Loader2, CheckCircle2, AlertCircle, FileUp, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BackToHomeButton } from './BackToHomeButton';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
  topic: z.enum(['Support', 'Feedback', 'Report abuse', 'Partnership']),
  phone: z.string().optional(),
  attachment: z.any().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

export const ContactForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<ContactResponse | null>(null);  const successHeadingRef = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => {
    if (submissionResult?.success && successHeadingRef.current) {
      successHeadingRef.current.focus();
    }
  }, [submissionResult]);  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      topic: 'Support',
    },
  });

  const selectedTopic = watch('topic');

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmissionResult(null);

    try {
      const result = await contactService.sendContact({
        ...data,
        attachment: data.attachment?.[0], // Get the first file if exists
      });
      setSubmissionResult(result);
      if (result.success) {
        reset();
      }
    } catch (error) {
      setSubmissionResult({
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submissionResult?.success) {
    return (
      <div 
        role="alert"
        aria-labelledby="success-heading"
        className="bg-white p-8 rounded-2xl shadow-sm border border-teal-100 text-center animate-in fade-in zoom-in duration-300"
      >
        <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-teal-600" />
        </div>
        <h2 
          id="success-heading" 
          ref={successHeadingRef}
          className="text-2xl font-bold text-slate-900 mb-2 focus:outline-none" 
          tabIndex={-1}
        >
          Message Sent!
        </h2>
        <p className="text-slate-600 mb-6">
          Thanks — we received your request <span className="font-bold text-teal-700">(Ticket: {submissionResult.ticketId})</span>. 
          We'll reply within 48 hours.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline" 
            onClick={() => setSubmissionResult(null)}
          >
            Send another message
          </Button>
          <BackToHomeButton />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      {submissionResult && !submissionResult.success && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {submissionResult.error}
            <button 
              type="button" 
              onClick={handleSubmit(onSubmit)} 
              className="ml-2 underline font-semibold"
            >
              Retry
            </button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-semibold text-slate-700">Full Name *</label>
          <Input 
            id="name"
            placeholder="John Doe"
            {...register('name')}
            aria-invalid={errors.name ? 'true' : 'false'}
          />
          {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address *</label>
          <Input 
            id="email"
            type="email"
            placeholder="john@example.com"
            {...register('email')}
            aria-invalid={errors.email ? 'true' : 'false'}
          />
          {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="topic" className="text-sm font-semibold text-slate-700">Topic *</label>
          <Select 
            value={selectedTopic} 
            onValueChange={(val: any) => setValue('topic', val)}
          >
            <SelectTrigger id="topic">
              <SelectValue placeholder="Select a topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Support">Support</SelectItem>
              <SelectItem value="Feedback">Feedback</SelectItem>
              <SelectItem value="Report abuse">Report abuse</SelectItem>
              <SelectItem value="Partnership">Partnership</SelectItem>
            </SelectContent>
          </Select>
          {errors.topic && <p className="text-xs text-red-500 font-medium">{errors.topic.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-semibold text-slate-700">Phone (Optional)</label>
          <Input 
            id="phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            {...register('phone')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="subject" className="text-sm font-semibold text-slate-700">Subject *</label>
        <Input 
          id="subject"
          placeholder="How can we help?"
          {...register('subject')}
          aria-invalid={errors.subject ? 'true' : 'false'}
        />
        {errors.subject && <p className="text-xs text-red-500 font-medium">{errors.subject.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-semibold text-slate-700">Message * (Min 20 characters)</label>
        <Textarea 
          id="message"
          placeholder="Tell us more about your inquiry..."
          className="min-h-[150px]"
          {...register('message')}
          aria-invalid={errors.message ? 'true' : 'false'}
        />
        {errors.message && <p className="text-xs text-red-500 font-medium">{errors.message.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="attachment" className="text-sm font-semibold text-slate-700">Attachment (Max 10MB; jpg/png/pdf)</label>
        <div className="relative">
          <Input 
            id="attachment"
            type="file"
            className="cursor-pointer"
            {...register('attachment')}
            accept=".jpg,.jpeg,.png,.pdf"
          />
          <FileUp className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Max file size: 10MB</p>
      </div>

      <div className="pt-4 flex flex-col gap-4">
        <p className="text-xs text-slate-500">
          By contacting us you agree to our <Link to="/privacy-policy" className="text-teal-600 hover:underline">Privacy Policy</Link>.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-bold h-12 px-8"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </>
            )}
          </Button>
          <BackToHomeButton isDirty={isDirty} className="w-full sm:w-auto" />
        </div>
      </div>
    </form>
  );
};
