export default function Section({ title, children }) {
    return (
        <section className="section animate-pop-up delay-100">
            <h2>{title}</h2>
            <div>{children}</div>
        </section>
    )
}
