import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════
// MS SYSTEM — POS CASHIER  |  Dark Navy + Gold
// ═══════════════════════════════════════════════

const GOLD   = "#C9A84C";
const GOLD2  = "#E8C96A";
const NAVY   = "#0B1628";
const NAVY2  = "#0F1F38";
const NAVY3  = "#162944";
const NAVY4  = "#1E3A5F";
const WHITE  = "#F0F4FF";
const MUTED  = "#7A90B0";
const SUCCESS= "#2DD4BF";
const DANGER = "#F87171";

const CATS = ["الكل","إلكترونيات","مواد غذائية","قطع غيار","منظفات"];
const PRODUCTS = [
  {id:1,name:"سماعة بلوتوث",nameEn:"BT Headset",    cat:"إلكترونيات", price:120,cost:80, emoji:"🎧",barcode:"6001001",stock:45},
  {id:2,name:"كابل شاحن",   nameEn:"Charger Cable",  cat:"إلكترونيات", price:25, cost:12, emoji:"🔌",barcode:"6001002",stock:8},
  {id:3,name:"باور بنك",    nameEn:"Power Bank",     cat:"إلكترونيات", price:180,cost:110,emoji:"🔋",barcode:"6001003",stock:20},
  {id:4,name:"ساعة ذكية",   nameEn:"Smart Watch",    cat:"إلكترونيات", price:350,cost:220,emoji:"⌚",barcode:"6001004",stock:15},
  {id:5,name:"زيت محرك 4L", nameEn:"Engine Oil",     cat:"قطع غيار",   price:95, cost:60, emoji:"🛢️",barcode:"6003001",stock:30},
  {id:6,name:"فلتر هواء",   nameEn:"Air Filter",     cat:"قطع غيار",   price:45, cost:28, emoji:"🔧",barcode:"6003002",stock:4},
  {id:7,name:"شامبو 500ml", nameEn:"Shampoo",        cat:"منظفات",      price:18, cost:10, emoji:"🧴",barcode:"6004001",stock:60},
  {id:8,name:"معجون أسنان", nameEn:"Toothpaste",     cat:"منظفات",      price:12, cost:6,  emoji:"🪥",barcode:"6004002",stock:2},
  {id:9,name:"مياه معدنية", nameEn:"Water 1.5L",     cat:"مواد غذائية", price:5,  cost:2,  emoji:"💧",barcode:"6002001",stock:100},
  {id:10,name:"عصير برتقال",nameEn:"Orange Juice",   cat:"مواد غذائية", price:8,  cost:4,  emoji:"🍊",barcode:"6002002",stock:50},
  {id:11,name:"شيبس",       nameEn:"Chips",          cat:"مواد غذائية", price:6,  cost:3,  emoji:"🍟",barcode:"6002003",stock:80},
  {id:12,name:"شوكولاتة",   nameEn:"Chocolate",      cat:"مواد غذائية", price:15, cost:8,  emoji:"🍫",barcode:"6002004",stock:40},
];

const CUSTOMERS = [
  {id:1,name:"أحمد محمد",  code:"CUS-0001",balance:-200},
  {id:2,name:"سارة عبدالله",code:"CUS-0002",balance:0},
  {id:3,name:"خالد العتيبي",code:"CUS-0003",balance:150},
];

const PAY_METHODS = [
  {k:"cash",  label:"نقدي",    icon:"💵"},
  {k:"card",  label:"بطاقة",   icon:"💳"},
  {k:"debit", label:"آجل",     icon:"📋"},
];

let invCounter = 1042;
const nextInv = () => `INV-${String(++invCounter).padStart(5,"0")}`;
const fmt = n => Number(n||0).toLocaleString("ar-EG",{minimumFractionDigits:2,maximumFractionDigits:2});
const now  = () => new Date().toLocaleTimeString("ar-EG",{hour:"2-digit",minute:"2-digit"});
const tod  = () => new Date().toLocaleDateString("ar-EG",{weekday:"long",year:"numeric",month:"long",day:"numeric"});

// ── Receipt Modal ──────────────────────────────
function Receipt({inv,onClose}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center"}}
      onClick={onClose}>
      <div onClick={e=>e.stopPropagation()}
        style={{background:"#fff",borderRadius:12,padding:32,width:320,fontFamily:"'Cairo',sans-serif",direction:"rtl",boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}>
        <div style={{textAlign:"center",marginBottom:16,borderBottom:"2px dashed #e5e7eb",paddingBottom:16}}>
          <div style={{fontSize:28,marginBottom:4}}>🏪</div>
          <h3 style={{margin:0,fontSize:18,fontWeight:800,color:NAVY}}>MS System</h3>
          <p style={{margin:"2px 0 0",fontSize:11,color:"#6b7280"}}>Professional Management System</p>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#6b7280",marginBottom:12}}>
          <span>{inv.code}</span><span>{inv.time}</span>
        </div>
        {inv.customer&&<div style={{background:"#f8fafc",borderRadius:8,padding:"6px 10px",marginBottom:12,fontSize:12}}><strong>العميل:</strong> {inv.customer}</div>}
        {inv.items.map((it,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"5px 0",borderBottom:"1px solid #f3f4f6"}}>
            <span>{it.emoji} {it.name} × {it.qty}</span>
            <strong>{fmt(it.price*it.qty)}</strong>
          </div>
        ))}
        <div style={{marginTop:12,borderTop:"2px dashed #e5e7eb",paddingTop:12}}>
          {inv.discount>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#059669"}}><span>خصم</span><span>−{fmt(inv.discount)}</span></div>}
          {inv.tax>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#6b7280"}}><span>ضريبة {inv.taxRate}%</span><span>+{fmt(inv.tax)}</span></div>}
          <div style={{display:"flex",justifyContent:"space-between",fontSize:16,fontWeight:800,color:NAVY,marginTop:8}}>
            <span>الإجمالي</span><span>{fmt(inv.total)} ر.س</span>
          </div>
          {inv.method==="cash"&&inv.change>0&&(
            <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#059669",marginTop:4}}>
              <span>الباقي</span><span>{fmt(inv.change)} ر.س</span>
            </div>
          )}
        </div>
        <div style={{textAlign:"center",marginTop:16,fontSize:11,color:"#9ca3af",borderTop:"1px solid #f3f4f6",paddingTop:12}}>
          شكراً لزيارتكم • Powered by MS System
        </div>
        <button onClick={onClose} style={{width:"100%",marginTop:14,background:NAVY,color:"#fff",border:"none",borderRadius:8,padding:12,cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:14}}>
          ✅ إغلاق
        </button>
      </div>
    </div>
  );
}

// ── Main POS ───────────────────────────────────
export default function POS(){
  const [cat,   setCat]    = useState("الكل");
  const [search,setSearch] = useState("");
  const [cart,  setCart]   = useState([]);
  const [custId,setCustId] = useState("");
  const [discount,setDiscount] = useState(0);
  const [taxRate,setTaxRate]   = useState(15);
  const [payMethod,setPayMethod] = useState("cash");
  const [cashGiven,setCashGiven] = useState("");
  const [receipt, setReceipt]  = useState(null);
  const [flash,   setFlash]    = useState(null);
  const [clock,   setClock]    = useState(now());
  const barcodeRef = useRef();

  useEffect(()=>{
    const t=setInterval(()=>setClock(now()),30000);
    return()=>clearInterval(t);
  },[]);

  const filtered = PRODUCTS.filter(p=>{
    if(cat!=="الكل"&&p.cat!==cat) return false;
    if(search&&!p.name.includes(search)&&!p.barcode.includes(search)&&!p.nameEn.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const addToCart = (p,qty=1)=>{
    setCart(c=>{
      const ex=c.find(i=>i.id===p.id);
      if(ex) return c.map(i=>i.id===p.id?{...i,qty:i.qty+qty}:i);
      return[...c,{...p,qty}];
    });
    setFlash(p.id);
    setTimeout(()=>setFlash(null),400);
  };

  const updateQty=(id,qty)=>{
    if(qty<1){setCart(c=>c.filter(i=>i.id!==id));return;}
    setCart(c=>c.map(i=>i.id===id?{...i,qty}:i));
  };

  const subTotal  = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const discAmt   = Math.min(discount||0, subTotal);
  const taxAmt    = (subTotal-discAmt)*(taxRate/100);
  const total     = subTotal - discAmt + taxAmt;
  const change    = payMethod==="cash" ? Math.max(0,(+cashGiven||0)-total) : 0;

  const checkout=()=>{
    if(!cart.length) return;
    const cust = CUSTOMERS.find(c=>c.id===+custId);
    const inv={
      code:nextInv(), time:now(), date:tod(),
      customer:cust?.name||null,
      items:cart, subTotal, discount:discAmt, taxRate, tax:taxAmt,
      total, method:payMethod, cashGiven:+cashGiven||0, change,
    };
    setReceipt(inv);
    setCart([]);setDiscount(0);setCashGiven("");setCustId("");
  };

  // ── quick cash given buttons
  const quickCash = [50,100,200,500].filter(v=>v>=total);

  return(
    <div style={{display:"flex",height:"100vh",background:NAVY,fontFamily:"'Cairo','Tajawal',sans-serif",direction:"rtl",overflow:"hidden",color:WHITE}}>

      {/* ═══ LEFT — PRODUCTS ═══ */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",borderLeft:`1px solid ${NAVY4}`}}>

        {/* Header */}
        <div style={{background:NAVY2,padding:"14px 20px",borderBottom:`1px solid ${NAVY4}`,display:"flex",alignItems:"center",gap:16,flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{background:`linear-gradient(135deg,${GOLD},${GOLD2})`,borderRadius:10,width:38,height:38,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:900,color:NAVY,boxShadow:`0 0 16px ${GOLD}40`}}>M</div>
            <div>
              <p style={{margin:0,fontWeight:800,fontSize:15,color:WHITE,letterSpacing:1}}>MS <span style={{color:GOLD}}>SYSTEM</span></p>
              <p style={{margin:0,fontSize:10,color:MUTED}}>Point of Sale</p>
            </div>
          </div>
          <div style={{flex:1}}>
            <input
              ref={barcodeRef}
              value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="🔍  بحث بالاسم أو الباركود..."
              style={{width:"100%",background:NAVY3,border:`1px solid ${NAVY4}`,borderRadius:10,padding:"9px 16px",color:WHITE,fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}
              onFocus={e=>e.target.style.borderColor=GOLD}
              onBlur={e=>e.target.style.borderColor=NAVY4}
            />
          </div>
          <div style={{textAlign:"left",flexShrink:0}}>
            <p style={{margin:0,fontSize:18,fontWeight:800,color:GOLD}}>{clock}</p>
            <p style={{margin:0,fontSize:10,color:MUTED}}>{new Date().toLocaleDateString("ar-EG")}</p>
          </div>
        </div>

        {/* Categories */}
        <div style={{display:"flex",gap:8,padding:"12px 20px",background:NAVY2,borderBottom:`1px solid ${NAVY4}`,flexShrink:0,overflowX:"auto"}}>
          {CATS.map(c=>(
            <button key={c} onClick={()=>setCat(c)} style={{
              border:"none",borderRadius:20,padding:"6px 18px",cursor:"pointer",
              background:cat===c?`linear-gradient(135deg,${GOLD},${GOLD2})`:NAVY3,
              color:cat===c?NAVY:MUTED,fontWeight:700,fontFamily:"inherit",fontSize:13,
              whiteSpace:"nowrap",transition:"all 0.15s",
              boxShadow:cat===c?`0 4px 14px ${GOLD}50`:"none",
            }}>{c}</button>
          ))}
        </div>

        {/* Products Grid */}
        <div style={{flex:1,overflowY:"auto",padding:16,display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:10,alignContent:"start"}}>
          {filtered.map(p=>(
            <button key={p.id} onClick={()=>addToCart(p)}
              style={{
                background:flash===p.id?`linear-gradient(135deg,${GOLD}30,${GOLD2}10)`:NAVY3,
                border:`1px solid ${flash===p.id?GOLD:NAVY4}`,
                borderRadius:12,padding:"14px 10px",cursor:"pointer",
                textAlign:"center",color:WHITE,fontFamily:"inherit",
                transition:"all 0.15s",position:"relative",
                boxShadow:flash===p.id?`0 0 20px ${GOLD}40`:"none",
                transform:flash===p.id?"scale(0.96)":"scale(1)",
              }}
              onMouseEnter={e=>{e.currentTarget.style.background=NAVY4;e.currentTarget.style.borderColor=GOLD+"80";}}
              onMouseLeave={e=>{e.currentTarget.style.background=NAVY3;e.currentTarget.style.borderColor=NAVY4;}}
            >
              {p.stock<=p.minStock&&<span style={{position:"absolute",top:6,left:6,background:DANGER,borderRadius:4,fontSize:9,padding:"1px 5px",fontWeight:700}}>منخفض</span>}
              <div style={{fontSize:32,marginBottom:6}}>{p.emoji}</div>
              <p style={{margin:"0 0 4px",fontSize:12,fontWeight:700,lineHeight:1.3}}>{p.name}</p>
              <p style={{margin:"0 0 2px",fontSize:9,color:MUTED}}>{p.nameEn}</p>
              <p style={{margin:"4px 0 0",fontSize:15,fontWeight:800,color:GOLD}}>{p.price} <span style={{fontSize:10}}>ر.س</span></p>
            </button>
          ))}
          {filtered.length===0&&(
            <div style={{gridColumn:"1/-1",textAlign:"center",padding:60,color:MUTED}}>
              <div style={{fontSize:40,marginBottom:10}}>🔍</div>
              <p>لا توجد منتجات</p>
            </div>
          )}
        </div>
      </div>

      {/* ═══ RIGHT — CART ═══ */}
      <div style={{width:360,background:NAVY2,display:"flex",flexDirection:"column",borderRight:`1px solid ${NAVY4}`,flexShrink:0}}>

        {/* Cart Header */}
        <div style={{padding:"16px 20px",borderBottom:`1px solid ${NAVY4}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div>
            <h3 style={{margin:0,fontSize:16,fontWeight:800,color:WHITE}}>🧾 الفاتورة</h3>
            <p style={{margin:0,fontSize:11,color:MUTED}}>{cart.length} صنف • {cart.reduce((s,i)=>s+i.qty,0)} قطعة</p>
          </div>
          {cart.length>0&&(
            <button onClick={()=>setCart([])} style={{background:"transparent",border:`1px solid ${DANGER}40`,borderRadius:8,padding:"4px 12px",cursor:"pointer",color:DANGER,fontSize:11,fontFamily:"inherit"}}>
              🗑️ مسح
            </button>
          )}
        </div>

        {/* Customer */}
        <div style={{padding:"10px 16px",borderBottom:`1px solid ${NAVY4}`,flexShrink:0}}>
          <select value={custId} onChange={e=>setCustId(e.target.value)}
            style={{width:"100%",background:NAVY3,border:`1px solid ${NAVY4}`,borderRadius:8,padding:"8px 12px",color:custId?WHITE:MUTED,fontFamily:"inherit",fontSize:13,outline:"none"}}>
            <option value="">👤 عميل عابر (بدون حساب)</option>
            {CUSTOMERS.map(c=><option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
          </select>
        </div>

        {/* Cart Items */}
        <div style={{flex:1,overflowY:"auto",padding:"8px 12px"}}>
          {cart.length===0?(
            <div style={{textAlign:"center",padding:"50px 20px",color:MUTED}}>
              <div style={{fontSize:48,marginBottom:10,opacity:.4}}>🛒</div>
              <p style={{fontSize:13}}>اضغط على أي منتج لإضافته</p>
            </div>
          ):cart.map(it=>(
            <div key={it.id} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 10px",marginBottom:6,background:NAVY3,borderRadius:10,border:`1px solid ${NAVY4}`}}>
              <span style={{fontSize:22,flexShrink:0}}>{it.emoji}</span>
              <div style={{flex:1,minWidth:0}}>
                <p style={{margin:0,fontSize:12,fontWeight:700,color:WHITE,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{it.name}</p>
                <p style={{margin:0,fontSize:11,color:GOLD}}>{it.price} × {it.qty} = <strong>{fmt(it.price*it.qty)}</strong></p>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
                <button onClick={()=>updateQty(it.id,it.qty-1)} style={{background:NAVY4,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",color:WHITE,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                <span style={{color:WHITE,fontWeight:700,fontSize:13,minWidth:20,textAlign:"center"}}>{it.qty}</span>
                <button onClick={()=>updateQty(it.id,it.qty+1)} style={{background:GOLD,border:"none",borderRadius:6,width:26,height:26,cursor:"pointer",color:NAVY,fontSize:14,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
              </div>
            </div>
          ))}
        </div>

        {/* Totals & Payment */}
        <div style={{padding:"12px 16px",borderTop:`1px solid ${NAVY4}`,flexShrink:0,background:NAVY}}>
          {/* Discount & Tax */}
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <div style={{flex:1}}>
              <label style={{fontSize:10,color:MUTED,display:"block",marginBottom:3}}>خصم (ر.س)</label>
              <input type="number" value={discount||""} onChange={e=>setDiscount(+e.target.value||0)} placeholder="0"
                style={{width:"100%",background:NAVY3,border:`1px solid ${NAVY4}`,borderRadius:8,padding:"7px 10px",color:WHITE,fontFamily:"inherit",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
            </div>
            <div style={{flex:1}}>
              <label style={{fontSize:10,color:MUTED,display:"block",marginBottom:3}}>ضريبة %</label>
              <input type="number" value={taxRate} onChange={e=>setTaxRate(+e.target.value||0)}
                style={{width:"100%",background:NAVY3,border:`1px solid ${NAVY4}`,borderRadius:8,padding:"7px 10px",color:WHITE,fontFamily:"inherit",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
            </div>
          </div>

          {/* Summary */}
          <div style={{background:NAVY3,borderRadius:10,padding:"10px 14px",marginBottom:10}}>
            {[["المجموع الفرعي",fmt(subTotal)],
              discount>0&&["خصم",`−${fmt(discAmt)}`],
              taxRate>0&&[`ضريبة ${taxRate}%`,`+${fmt(taxAmt)}`],
            ].filter(Boolean).map(([l,v],i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:MUTED,marginBottom:4}}>
                <span>{l}</span><span>{v}</span>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",fontSize:18,fontWeight:900,color:GOLD,borderTop:`1px solid ${NAVY4}`,marginTop:6,paddingTop:8}}>
              <span>الإجمالي</span><span>{fmt(total)} ر.س</span>
            </div>
          </div>

          {/* Payment Method */}
          <div style={{display:"flex",gap:6,marginBottom:10}}>
            {PAY_METHODS.map(m=>(
              <button key={m.k} onClick={()=>setPayMethod(m.k)} style={{
                flex:1,border:"none",borderRadius:8,padding:"8px 4px",cursor:"pointer",
                background:payMethod===m.k?`linear-gradient(135deg,${GOLD},${GOLD2})`:NAVY3,
                color:payMethod===m.k?NAVY:MUTED,fontWeight:700,fontFamily:"inherit",fontSize:12,
                transition:"all 0.15s",
              }}>{m.icon} {m.label}</button>
            ))}
          </div>

          {/* Cash Given */}
          {payMethod==="cash"&&(
            <div style={{marginBottom:10}}>
              <input type="number" value={cashGiven} onChange={e=>setCashGiven(e.target.value)}
                placeholder="المبلغ المدفوع (ر.س)"
                style={{width:"100%",background:NAVY3,border:`1px solid ${cashGiven&&+cashGiven>=total?SUCCESS:NAVY4}`,borderRadius:8,padding:"8px 12px",color:WHITE,fontFamily:"inherit",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:6}}/>
              <div style={{display:"flex",gap:4"}}>
                {quickCash.slice(0,4).map(v=>(
                  <button key={v} onClick={()=>setCashGiven(String(v))} style={{flex:1,background:NAVY3,border:`1px solid ${NAVY4}`,borderRadius:6,padding:"5px",cursor:"pointer",color:MUTED,fontSize:11,fontFamily:"inherit"}}>
                    {v}
                  </button>
                ))}
                <button onClick={()=>setCashGiven(String(Math.ceil(total/10)*10))} style={{flex:1,background:NAVY4,border:`1px solid ${GOLD}40`,borderRadius:6,padding:"5px",cursor:"pointer",color:GOLD,fontSize:10,fontFamily:"inherit",fontWeight:700}}>
                  تقريب
                </button>
              </div>
              {cashGiven&&+cashGiven>=total&&(
                <div style={{background:`${SUCCESS}15`,border:`1px solid ${SUCCESS}40`,borderRadius:8,padding:"6px 12px",marginTop:6,display:"flex",justifyContent:"space-between",fontSize:13}}>
                  <span style={{color:SUCCESS}}>الباقي</span>
                  <strong style={{color:SUCCESS}}>{fmt(change)} ر.س</strong>
                </div>
              )}
            </div>
          )}

          {/* Checkout Button */}
          <button onClick={checkout} disabled={!cart.length||(payMethod==="cash"&&cashGiven&&+cashGiven<total)}
            style={{
              width:"100%",padding:"14px",border:"none",borderRadius:12,cursor:cart.length?"pointer":"not-allowed",
              background:cart.length?`linear-gradient(135deg,${GOLD},${GOLD2})`:"#2a3a52",
              color:cart.length?NAVY:MUTED,fontSize:16,fontWeight:900,fontFamily:"inherit",
              boxShadow:cart.length?`0 6px 24px ${GOLD}50`:"none",
              transition:"all 0.2s",letterSpacing:0.5,
            }}>
            {cart.length?`✅ إتمام البيع — ${fmt(total)} ر.س`:"🛒 السلة فارغة"}
          </button>
        </div>
      </div>

      {/* Receipt Modal */}
      {receipt&&<Receipt inv={receipt} onClose={()=>setReceipt(null)}/>}

      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');*{scrollbar-width:thin;scrollbar-color:${NAVY4} ${NAVY2}}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:${NAVY2}}::-webkit-scrollbar-thumb{background:${NAVY4};border-radius:4px}`}</style>
    </div>
  );
}
