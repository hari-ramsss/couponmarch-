interface FeatureCardProps {
    icon: string;
    title: string;
    description: string;
    bgColor: string;
}

export default function FeatureCard({ icon, title, description, bgColor }: FeatureCardProps) {
    return (
        <div className="bg-white rounded-2xl border-6 border-pure-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
            <div className={`${bgColor} rounded-2xl border-4 border-pure-black w-16 h-16 flex items-center justify-center text-3xl mb-6`}>
                {icon}
            </div>
            <h3 className="mb-4 text-2xl">{title}</h3>
            <p className="font-body text-muted-gray leading-relaxed">
                {description}
            </p>
        </div>
    );
}
