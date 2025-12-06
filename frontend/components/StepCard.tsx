interface StepCardProps {
    step: string;
    icon: string;
    title: string;
    description: string;
}

export default function StepCard({ step, icon, title, description }: StepCardProps) {
    return (
        <div className="bg-white rounded-2xl border-6 border-pure-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 hover:translate-y-[-4px] transition-transform">
            <div className="text-6xl mb-4 text-center">{icon}</div>
            <div className="bg-punchy-red text-white px-3 py-1 rounded-full border-3 border-pure-black font-bold text-xs inline-block mb-3">
                STEP {step}
            </div>
            <h4 className="mb-2 text-xl">{title}</h4>
            <p className="font-body text-sm text-muted-gray">{description}</p>
        </div>
    );
}
