import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Mail, Clock, Shield, FileText, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SupportInfoCard: React.FC = () => {
  return (
    <Card className="border-teal-100 bg-teal-50/30">
      <CardHeader>
        <CardTitle className="text-teal-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-teal-600" />
          Support Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <section>
          <h3 className="text-sm font-bold text-teal-800 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Support Hours
          </h3>
          <p className="text-sm text-slate-600">
            Monday - Friday: 9:00 AM - 6:00 PM<br />
            Saturday: 10:00 AM - 4:00 PM<br />
            Closed on Sundays
          </p>
        </section>

        <section>
          <h3 className="text-sm font-bold text-teal-800 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Contact Info
          </h3>
          <p className="text-sm text-slate-600">
            Email: <a href="mailto:support@findrhub.com" className="text-teal-600 hover:underline">support@findrhub.com</a><br />
            Response Time: Within 48 hours
          </p>
        </section>

        <section>
          <h3 className="text-sm font-bold text-teal-800 uppercase tracking-wider mb-2">
            Quick Links
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/privacy-policy" className="flex items-center gap-2 text-slate-600 hover:text-teal-600 transition-colors">
                <Shield className="w-4 h-4" />
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms-of-service" className="flex items-center gap-2 text-slate-600 hover:text-teal-600 transition-colors">
                <FileText className="w-4 h-4" />
                Terms of Service
              </Link>
            </li>
          </ul>
        </section>

        <div className="pt-4 border-t border-teal-100">
          <p className="text-xs text-slate-500 italic">
            FindrHub is committed to helping communities reunite with their lost items.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
