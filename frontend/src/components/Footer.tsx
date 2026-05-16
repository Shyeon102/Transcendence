const Footer = () => {
  return (
    <div className="flex justify-between text-[0.80vw] px-[2vw] pt-[7vh]">
      {/* 왼쪽 */}
      <div className="flex gap-[2vw]">
        <p>Privacy Policy</p>
        <p>Terms of Service</p>
        <p>credits</p>
      </div>
      {/* 오른쪽 */}
      <div className="flex gap-[2vw]">
        <p>© 2026 Project. All Rights Reserved</p>
        <button className="border" onClick={() => {}}>
          English
        </button>
      </div>
    </div>
  );
};

export default Footer;
