import React from "react";
import { Container } from "react-bootstrap";

function Footer() {
    return (
        <footer style={{background:"#fff",borderTop:"1px solid #ececec",padding:"16px 0"}}>
            <Container className="d-flex justify-content-between small text-muted">
                <div>© {new Date().getFullYear()} Lost & Found</div>
                <div>
                    <a href="#" style={{marginRight:12,color:"inherit",textDecoration:"none"}}>Privacy</a>
                    <a href="#" style={{color:"inherit",textDecoration:"none"}}>Help</a>
                </div>
            </Container>
        </footer>
    );
}

export default Footer;