import React from 'react';
import { Heart, ShieldCheck, Users } from 'lucide-react';
import { Card, Container, Grid } from '../../../../ui';

interface CallToActionSectionProps {
  isBelowDesktop: boolean;
}

const CallToActionSection: React.FC<CallToActionSectionProps> = ({ isBelowDesktop }) => {
  return (
    <div className="bg-slate-900 py-24 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600 rounded-full blur-[120px]"></div>
      </div>

      <Container className="relative z-10">
        <Card className="border-none shadow-2xl rounded-[3rem] bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
          <div className="p-12 md:p-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm font-bold mb-8">
              <Heart size={16} className="text-orange-500" />
              Community Driven
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">
              Ready to Help Your <br/>
              <span className="text-teal-400">Community?</span> 🤝
            </h2>
            
            <p className="text-slate-400 text-xl font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
              Join thousands of people helping reunite lost items with their owners.
              Every report counts and makes a difference in someone's life.
            </p>

            <Grid cols={3} gap={8} className="max-w-4xl mx-auto">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-teal-400 border border-white/10">
                  <ShieldCheck size={32} />
                </div>
                <div className="text-white font-bold">Secure Platform</div>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-emerald-400 border border-white/10">
                  <Users size={32} />
                </div>
                <div className="text-white font-bold">10k+ Members</div>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-rose-400 border border-white/10">
                  <Heart size={32} />
                </div>
                <div className="text-white font-bold">Free Forever</div>
              </div>
            </Grid>
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default CallToActionSection;

