/// <reference types="vite/client" />
import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend as RechartsLegend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type AnyData = any;

// --- ESTILO DEL BOTÓN CERRAR UNIVERSAL (Pequeño y en la esquina) ---
const closeBtnStyle: any = {
    position: 'absolute', top: '15px', right: '15px', background: '#1e293b', color: 'white', width: '28px', height: '28px', 
    borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.8rem', 
    cursor: 'pointer', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', transition: 'transform 0.2s', zIndex: 10
};

// --- COMPONENTES MODALES ---

const AlertModal = ({ show, title, message, type, onClose }: AnyData) => {
    if (!show) return null;
    const isError = type === 'error';
    return (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.8)', zIndex:12000, display:'flex', justifyContent:'center', alignItems:'center', backdropFilter:'blur(5px)'}}>
            <div style={{background:'white', padding:'30px', borderRadius:'20px', width:'90%', maxWidth:'350px', textAlign:'center', boxShadow:'0 20px 50px rgba(0,0,0,0.5)', position:'relative'}}>
                <button onClick={onClose} style={closeBtnStyle}>✖</button>
                <div style={{fontSize:'3rem', marginBottom:'15px'}}>{isError ? '❌' : 'ℹ️'}</div>
                <h3 style={{margin:'0 0 10px 0', color: isError ? '#ef4444' : '#1e293b'}}>{title}</h3>
                <p style={{color:'#64748b', marginBottom:'20px'}}>{message}</p>
                <button onClick={onClose} style={{padding:'10px 25px', background: isError ? '#ef4444' : '#3b82f6', color:'white', border:'none', borderRadius:'10px', fontWeight:'bold', cursor:'pointer', width:'100%'}}>Entendido</button>
            </div>
        </div>
    );
};

const SuccessModal = ({ show, message, onClose }: AnyData) => {
    if (!show) return null;
    return (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.8)', zIndex:11000, display:'flex', justifyContent:'center', alignItems:'center'}}>
            <div style={{background:'white', padding:'30px', borderRadius:'20px', width:'90%', maxWidth:'300px', textAlign:'center', boxShadow:'0 20px 50px rgba(0,0,0,0.5)', position:'relative'}}>
                <button onClick={onClose} style={closeBtnStyle}>✖</button>
                <div style={{fontSize:'3rem', color:'#10b981', marginBottom:'15px'}}>✅</div>
                <h3 style={{margin:'0 0 20px 0', color:'#1e293b'}}>{message}</h3>
                <button onClick={onClose} style={{padding:'10px 25px', background:'#3b82f6', color:'white', border:'none', borderRadius:'10px', fontWeight:'bold', cursor:'pointer', width:'100%'}}>Aceptar</button>
            </div>
        </div>
    );
};

const ConfirmModal = ({ show, title, message, onConfirm, onCancel, confirmColor = '#3b82f6' }: AnyData) => {
    if (!show) return null;
    return (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.8)', zIndex:11002, display:'flex', justifyContent:'center', alignItems:'center'}}>
            <div style={{background:'white', padding:'30px', borderRadius:'20px', width:'90%', maxWidth:'400px', textAlign:'center', boxShadow:'0 20px 50px rgba(0,0,0,0.5)', position:'relative'}}>
                <button onClick={onCancel} style={closeBtnStyle}>✖</button>
                <h3 style={{marginTop:0, color:'#1e293b'}}>{title}</h3>
                <p style={{color:'#64748b', marginBottom:'25px'}}>{message}</p>
                <div style={{display:'flex', gap:'15px'}}>
                    <button onClick={onCancel} style={{flex:1, padding:'12px', borderRadius:'10px', border:'none', background:'#e2e8f0', color:'#475569', fontWeight:'bold', cursor:'pointer'}}>Cancelar</button>
                    <button onClick={onConfirm} style={{flex:1, padding:'12px', borderRadius:'10px', border:'none', background: confirmColor, color:'white', fontWeight:'bold', cursor:'pointer'}}>Confirmar</button>
                </div>
            </div>
        </div>
    );
};

const NewUserModal = ({ show, onConfirm, onCancel }: AnyData) => {
    if (!show) return null;
    const [u, setU] = useState(''); const [p, setP] = useState(''); const [r, setR] = useState('USUARIO');
    return (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.8)', zIndex:11003, display:'flex', justifyContent:'center', alignItems:'center'}}>
            <div style={{background:'white', padding:'30px', borderRadius:'20px', width:'90%', maxWidth:'350px', textAlign:'center', position:'relative'}}>
                <button onClick={onCancel} style={closeBtnStyle}>✖</button>
                <h3 style={{marginTop:0, color:'#1e293b'}}>👤 Nuevo Usuario</h3>
                <div style={{textAlign:'left', marginBottom:'15px'}}>
                    <label style={{fontWeight:'bold', color:'#64748b', fontSize:'0.8rem'}}>Usuario</label>
                    <input autoFocus value={u} onChange={(e: any) => setU(e.target.value)} style={{width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid #cbd5e1', boxSizing:'border-box', marginTop:'5px', color:'#1e293b'}} />
                </div>
                <div style={{textAlign:'left', marginBottom:'15px'}}>
                    <label style={{fontWeight:'bold', color:'#64748b', fontSize:'0.8rem'}}>Contraseña</label>
                    <input type="password" value={p} onChange={(e: any) => setP(e.target.value)} style={{width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid #cbd5e1', boxSizing:'border-box', marginTop:'5px', color:'#1e293b'}} />
                </div>
                <div style={{textAlign:'left', marginBottom:'25px'}}>
                    <label style={{fontWeight:'bold', color:'#64748b', fontSize:'0.8rem'}}>Rol</label>
                    <select value={r} onChange={(e: any) => setR(e.target.value)} style={{width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid #cbd5e1', boxSizing:'border-box', marginTop:'5px', color:'#1e293b'}}>
                        <option value="USUARIO">USUARIO (Operativo)</option>
                        <option value="CLIENTE">CLIENTE (Solo lectura)</option>
                        <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                    </select>
                </div>
                <div style={{display:'flex', gap:'10px'}}>
                    <button onClick={onCancel} style={{flex:1, padding:'10px', borderRadius:'8px', border:'none', background:'#e2e8f0', color:'#475569', cursor:'pointer', fontWeight:'bold'}}>Cancelar</button>
                    <button onClick={() => { onConfirm(u,p,r); setU(''); setP(''); }} style={{flex:1, padding:'10px', borderRadius:'8px', border:'none', background:'#10b981', color:'white', fontWeight:'bold', cursor:'pointer'}}>Crear</button>
                </div>
            </div>
        </div>
    );
};

const ConfigAlmacenModal = ({ show, ubicacionesActuales, onConfirm, onCancel }: AnyData) => {
    if (!show) return null;
    const [u, setU] = useState(ubicacionesActuales || 100);
    return (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.8)', zIndex:11003, display:'flex', justifyContent:'center', alignItems:'center'}}>
            <div style={{background:'white', padding:'30px', borderRadius:'20px', width:'90%', maxWidth:'350px', textAlign:'center', position:'relative'}}>
                <button onClick={onCancel} style={closeBtnStyle}>✖</button>
                <h3 style={{marginTop:0, color:'#1e293b'}}>⚙️ Configurar Almacén</h3>
                <p style={{color:'#64748b', fontSize:'0.85rem', marginBottom:'20px'}}>Cada ubicación equivale automáticamente a 1.32 m² (1.20m x 1.10m).</p>
                <div style={{textAlign:'left', marginBottom:'25px'}}>
                    <label style={{fontWeight:'bold', color:'#64748b', fontSize:'0.8rem'}}>Total de Ubicaciones Físicas</label>
                    <input type="number" autoFocus value={u} onChange={(e: any) => setU(Number(e.target.value))} style={{width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid #cbd5e1', boxSizing:'border-box', marginTop:'5px', color:'#1e293b'}} />
                </div>
                <div style={{display:'flex', gap:'10px'}}>
                    <button onClick={onCancel} style={{flex:1, padding:'10px', borderRadius:'8px', border:'none', background:'#e2e8f0', color:'#475569', cursor:'pointer', fontWeight:'bold'}}>Cancelar</button>
                    <button onClick={() => onConfirm(u)} style={{flex:1, padding:'10px', borderRadius:'8px', border:'none', background:'#1e293b', color:'white', fontWeight:'bold', cursor:'pointer'}}>Guardar</button>
                </div>
            </div>
        </div>
    );
};

const LoginModal = ({ show, type, creds, setCreds, onCancel, onSubmit }: AnyData) => {
    if (!show) return null;
    let title = type === 'admin_manage' ? 'Gestión de Usuarios' : 'Acceso al Sistema';

    return (
      <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.8)', zIndex:10000, display:'flex', justifyContent:'center', alignItems:'center', backdropFilter:'blur(5px)'}}>
          <div style={{background:'white', padding:'40px', borderRadius:'20px', width:'90%', maxWidth:'350px', textAlign:'center', boxShadow:'0 20px 50px rgba(0,0,0,0.5)', position:'relative'}}>
              <button onClick={onCancel} style={closeBtnStyle}>✖</button>
              <h2 style={{marginTop:0, color:'#1e293b', fontSize:'1.5rem', marginBottom:'30px'}}>🔐 {title}</h2>
              <form onSubmit={onSubmit}>
                  <div style={{textAlign:'left', marginBottom:'20px'}}>
                      <label style={{display:'block', marginBottom:'8px', fontWeight:'bold', color:'#64748b', fontSize:'0.9rem'}}>Usuario</label>
                      <input autoFocus value={creds.user} onChange={(e: any) => setCreds({...creds, user: e.target.value})} style={{width:'100%', padding:'14px', borderRadius:'10px', border:'1px solid #cbd5e1', fontSize:'1rem', boxSizing:'border-box', background:'#f8fafc', color:'#1e293b'}} />
                  </div>
                  <div style={{textAlign:'left', marginBottom:'30px'}}>
                      <label style={{display:'block', marginBottom:'8px', fontWeight:'bold', color:'#64748b', fontSize:'0.9rem'}}>Contraseña</label>
                      <input type="password" value={creds.pass} onChange={(e: any) => setCreds({...creds, pass: e.target.value})} style={{width:'100%', padding:'14px', borderRadius:'10px', border:'1px solid #cbd5e1', fontSize:'1rem', boxSizing:'border-box', background:'#f8fafc', color:'#1e293b'}} />
                  </div>
                  <div style={{display:'flex', gap:'10px'}}>
                      <button type="submit" style={{flex:1, padding:'14px', borderRadius:'10px', border:'none', background:'#1e293b', color:'white', fontWeight:'bold', cursor:'pointer', fontSize:'1rem'}}>Entrar</button>
                  </div>
              </form>
          </div>
      </div>
    );
};

const TraceabilityModal = ({ show, data, onClose }: AnyData) => {
    if (!show || !data) return null;
    let historial = data.historial ? [...data.historial] : (data.historial_origen ? [...data.historial_origen] : []);

    if (data.fechaSalida) {
        historial.push({ evento: `Solicitud de Salida`, usuario: data.usuario, fecha: data.fechaSalida, detalles: `Cant Extraída: ${data.box}` });
        historial.push({ evento: '✅ ENTREGADO', usuario: 'Sistema', fecha: data.created_at ? new Date(data.created_at).toLocaleString() : 'Reciente', detalles: 'Cierre de Almacén' });
    }

    return (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.6)', zIndex:9999, display:'flex', justifyContent:'center', alignItems:'center'}}>
            <div style={{background:'white', width:'90%', maxWidth:'500px', borderRadius:'15px', padding:'30px', maxHeight:'80vh', overflowY:'auto', boxShadow:'0 20px 50px rgba(0,0,0,0.5)', position:'relative'}}>
                <button onClick={onClose} style={closeBtnStyle}>✖</button>
                <h3 style={{margin:'0 0 20px 0', color:'#1e293b'}}>📦 Trazabilidad</h3>
                <div style={{background:'#f8fafc', padding:'15px', borderRadius:'10px', marginBottom:'20px', fontSize:'0.9rem', color:'#334155', border:'1px solid #e2e8f0'}}>
                    <p style={{margin:'5px 0'}}><strong>Item:</strong> {data.item}</p>
                    <p style={{margin:'5px 0'}}><strong>Serie:</strong> {data.serie}</p>
                    <p style={{margin:'5px 0'}}><strong>Cantidad Registrada:</strong> {data.box || '1'}</p>
                </div>
                <div style={{borderLeft:'3px solid #cbd5e1', paddingLeft:'15px', marginLeft:'5px'}}>
                    {historial.map((h: any, idx: number) => (
                        <div key={idx} style={{marginBottom:'15px', position:'relative'}}>
                            <div style={{position:'absolute', left:'-23px', top:'3px', width:'12px', height:'12px', background: h.evento.includes('ENTREGADO') ? '#10b981' : '#3b82f6', borderRadius:'50%'}}></div>
                            <div style={{fontSize:'0.75rem', color:'#64748b'}}>{h.fecha} • <b style={{color:'#1e293b'}}>{h.usuario}</b></div>
                            <div style={{fontSize:'0.9rem', fontWeight:'bold', color:'#1e293b'}}>{h.evento}</div>
                            {h.detalles && <div style={{fontSize:'0.8rem', color:'#64748b'}}>{h.detalles}</div>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default function App() {
  const [view, setView] = useState('main');
  const [tab, setTab] = useState('inventario');
  const [usuarioActual, setUsuarioActual] = useState({ user: '', role: '' });
  
  const [inventario, setInventario] = useState<AnyData[]>([]);
  const [salidas, setSalidas] = useState<AnyData[]>([]);
  const [usuariosDB, setUsuariosDB] = useState<AnyData[]>([]);
  const [totalUbicaciones, setTotalUbicaciones] = useState(100); 

  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ item: '', serie: '', ubicacion: '', box: '1', guia: '', estado_fisico: 'Cajas' });
  const [isDragging, setIsDragging] = useState(false); 
  const [scanningField, setScanningField] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const [modoEdicionUbicacion, setModoEdicionUbicacion] = useState(false);
  const [modalTrazabilidadState, setModalTrazabilidadState] = useState<{show: boolean, data: any}>({ show: false, data: null });
  
  const [loginModal, setLoginModal] = useState<{show: boolean, type: 'warehouse' | 'admin_manage'}>({ show: false, type: 'warehouse' });
  const [loginCreds, setLoginCreds] = useState({ user: '', pass: '' });
  
  const [modalSurtido, setModalSurtido] = useState<{show: boolean, item?: AnyData}>({ show: false });
  const [formSurtido, setFormSurtido] = useState({ cantidad_surtir: 1 });
  
  const [modalUsuario, setModalUsuario] = useState(false);
  const [modalConfig, setModalConfig] = useState(false);
  
  const [alertInfo, setAlertInfo] = useState({ show: false, title: '', message: '', type: 'info' });
  const [successModal, setSuccessModal] = useState({ show: false, message: '' });

  const showSuccess = (message: string) => setSuccessModal({ show: true, message });
  const showAlert = (title: string, message: string, type: 'info' | 'error' = 'info') => setAlertInfo({ show: true, title, message, type });

  const isClient = usuarioActual.role === 'CLIENTE';

  useEffect(() => {
    if (view === 'almacen') fetchData();
    if (view === 'admin') fetchUsuarios();
  }, [view]);

  useEffect(() => {
    let scanner: any;
    if (scanningField) {
      setTimeout(() => {
        scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
        scanner.render((decodedText: string) => {
            setForm(prev => ({ ...prev, [scanningField]: decodedText })); setScanningField(null); scanner.clear();
          }, () => {});
      }, 100);
    }
    return () => { if (scanner) scanner.clear().catch(console.error); };
  }, [scanningField]);

  const fetchData = async () => {
    const { data: inv } = await supabase.from('inventario').select('*');
    if (inv) {
        const parseDateSort = (dStr: string) => {
            if(!dStr || dStr === 'S/D') return 0;
            const p = dStr.split('/');
            if(p.length === 3) return new Date(Number(p[2]), Number(p[1])-1, Number(p[0])).getTime();
            return new Date(dStr).getTime() || 0;
        };
        const sortedInv = inv.sort((a, b) => {
            const diff = parseDateSort(a.fechaEntrada) - parseDateSort(b.fechaEntrada);
            if (diff !== 0) return diff;
            return String(a.item || '').localeCompare(String(b.item || ''), undefined, { numeric: true, sensitivity: 'base' });
        });
        setInventario(sortedInv);
    }
    
    const { data: sal } = await supabase.from('salidas').select('*');
    if (sal) {
        const parseFullDate = (dStr: string) => {
            if(!dStr || dStr === 'S/D') return 0;
            const nativeTime = new Date(dStr).getTime();
            if (!isNaN(nativeTime)) return nativeTime;
            const parts = dStr.split(/[\s,:]+/).filter(Boolean);
            if(parts.length >= 1 && parts[0].includes('/')) {
                const dp = parts[0].split('/');
                if(dp.length === 3) {
                    let h = Number(parts[1] || 0); const m = Number(parts[2] || 0); const s = Number(parts[3] || 0);
                    const isPM = dStr.toLowerCase().includes('pm'); const isAM = dStr.toLowerCase().includes('am');
                    if (isPM && h < 12) h += 12;
                    if (isAM && h === 12) h = 0;
                    return new Date(Number(dp[2]), Number(dp[1])-1, Number(dp[0]), h, m, s).getTime();
                }
            }
            return 0;
        };
        const sortedSal = sal.sort((a, b) => parseFullDate(a.fechaSalida) - parseFullDate(b.fechaSalida));
        setSalidas(sortedSal);
    }

    const { data: cfg } = await supabase.from('almacen_config').select('*').single();
    if (cfg && cfg.total_ubicaciones) setTotalUbicaciones(cfg.total_ubicaciones);
  };

  const fetchUsuarios = async () => { 
      const { data } = await supabase.from('perfiles').select('*').order('id', { ascending: true }); if (data) setUsuariosDB(data); 
      const { data: cfg } = await supabase.from('almacen_config').select('*').single();
      if (cfg && cfg.total_ubicaciones) setTotalUbicaciones(cfg.total_ubicaciones);
  };

  const openLogin = (type: 'warehouse' | 'admin_manage') => { setLoginCreds({ user: '', pass: '' }); setLoginModal({ show: true, type }); };
  
  const handleLoginSubmit = async (e: any) => {
      e.preventDefault(); const { user, pass } = loginCreds;
      if (loginModal.type === 'admin_manage') {
          if (user === "ZAHID" && pass === "130297") { 
              setUsuarioActual({ user: 'ZAHID', role: 'ADMINISTRADOR' });
              setLoginModal({ ...loginModal, show: false }); setView('admin'); return;
          }
      }
      const { data } = await supabase.from('perfiles').select('*').eq('user', user).eq('pass', pass).single();
      if (data) { 
          if(loginModal.type === 'admin_manage' && data.rol !== 'ADMINISTRADOR'){
              return showAlert('Permiso Insuficiente', 'Requiere privilegios de ADMINISTRADOR.', 'error');
          }
          setUsuarioActual({ user: data.user, role: data.rol }); 
          setView(loginModal.type === 'admin_manage' ? 'admin' : 'almacen'); 
          setTab('inventario'); 
          setLoginModal({ ...loginModal, show: false }); 
      } else { showAlert('Error', 'Credenciales incorrectas', 'error'); }
  };

  const handleUpdateUbicacionRapid = (id: number, campo: string, val: string) => { setInventario(prev => prev.map(item => item.id === id ? { ...item, [campo]: val.toUpperCase() } : item)); };
  const handleSaveUbicacionHistory = async (id: number, campo: string, val: string, ant: string) => { if (val === ant) return; const ts = new Date().toLocaleString(); const { data: current } = await supabase.from('inventario').select('historial').eq('id', id).single(); let hist = current?.historial || []; await supabase.from('inventario').update({ [campo]: val.toUpperCase(), historial: [...hist, { evento: `Cambio de ${campo}`, anterior: ant, nuevo: val.toUpperCase(), usuario: usuarioActual.user, fecha: ts }] }).eq('id', id); };

  const abrirModalSurtido = (item: any) => {
      const cantStock = parseInt(item.box) || 1;
      setFormSurtido({ cantidad_surtir: cantStock });
      setModalSurtido({ show: true, item });
  };

  const confirmarSurtido = async (e: any) => {
      e.preventDefault(); const item = modalSurtido.item; if (!item) return;
      
      const cantPedida = parseInt(formSurtido.cantidad_surtir as any);
      const cantStock = parseInt(item.box) || 1;

      if (isNaN(cantPedida) || cantPedida <= 0 || cantPedida > cantStock) return showAlert('Error', 'Cantidad inválida', 'error');

      const { error } = await supabase.from('salidas').insert([{ 
          item: item.item, serie: item.serie, ubicacion: item.ubicacion, guia: item.guia, 
          historial_origen: item.historial, fechaSalida: new Date().toLocaleString(), usuario: usuarioActual.user, 
          almacen: 'Querétaro', estatus_envio: 'Entregado', 
          fecha_entrada: item.fechaEntrada, box: cantPedida.toString(), estado_fisico: item.estado_fisico
      }]);

      if (!error) {
          if (cantPedida < cantStock) {
              const restante = cantStock - cantPedida;
              await supabase.from('inventario').update({ box: restante.toString() }).eq('id', item.id);
          } else {
              await supabase.from('inventario').delete().eq('id', item.id); 
          }
          fetchData(); setModalSurtido({ show: false }); showSuccess('Salida procesada con éxito');
      } else { showAlert("Error", error.message, "error"); }
  };

  const handleInsertEntrada = async (e: any) => {
    e.preventDefault(); const hist = [{ evento: 'Alta en Inventario', usuario: usuarioActual.user, fecha: new Date().toLocaleString() }];
    const { error } = await supabase.from('inventario').insert([{ ...form, usuario: usuarioActual.user, almacen: 'Querétaro', fechaEntrada: new Date().toLocaleDateString(), ubicacion: form.ubicacion.toUpperCase(), historial: hist }]);
    if (!error) { setForm({ item: '', serie: '', ubicacion: '', box: '1', guia: '', estado_fisico: 'Cajas' }); fetchData(); showSuccess('Material guardado'); }
  };

  const processFileComplete = async (file: File) => {
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls'); const isCSV = file.name.endsWith('.csv'); if (!isExcel && !isCSV) return showAlert("Error", "Formato no válido", "error");
    const reader = new FileReader(); reader.onload = async (event) => {
      let items: any[] = []; const res = event.target?.result; const hist = [{ evento: 'Importación Masiva', usuario: usuarioActual.user, fecha: new Date().toLocaleString(), detalles: 'Excel' }];
      if (isCSV && typeof res === 'string') { 
          items = res.split("\n").slice(1).map(row => { 
              const [i, s, u, b, est] = row.split(","); 
              if (!i) return null; 
              return { item: i.trim(), serie: s?.trim() || "", ubicacion: u?.trim().toUpperCase() || "", box: b?.trim() || "1", estado_fisico: est?.trim() || "Cajas", usuario: usuarioActual.user, almacen: 'Querétaro', fechaEntrada: new Date().toLocaleDateString(), historial: hist }; 
          }).filter(Boolean);
      } else if (isExcel && res instanceof ArrayBuffer) { 
          const wb = XLSX.read(new Uint8Array(res), { type: 'array' }); 
          items = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 }).slice(1).map((row: any) => { 
              if (!row[0]) return null; 
              return { item: String(row[0] || '').trim(), serie: String(row[1] || '').trim(), ubicacion: String(row[2] || '').trim().toUpperCase(), box: String(row[3] || '1').trim(), estado_fisico: String(row[4] || 'Cajas').trim(), usuario: usuarioActual.user, almacen: 'Querétaro', fechaEntrada: new Date().toLocaleDateString(), historial: hist }; 
          }).filter(Boolean); 
      }
      if (items.length > 0) { const BATCH = 500; for (let i = 0; i < items.length; i += BATCH) { await supabase.from('inventario').insert(items.slice(i, i + BATCH)); } showSuccess(`Se cargaron ${items.length} registros correctamente.`); fetchData(); }
    }; if (isCSV) reader.readAsText(file); else reader.readAsArrayBuffer(file);
  };
  
  const handleImportExcel = (e: any) => { if (e.target.files?.[0]) processFileComplete(e.target.files[0]); };
  const handleDrop = (e: any) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files && e.dataTransfer.files[0]) processFileComplete(e.dataTransfer.files[0]); };
  
  const exportarInventario = () => { 
      if (inventario.length === 0) return showAlert("Aviso", "No hay datos", "info"); 
      const data = inventario.map(i => ({ Item: i.item, Serie: i.serie, Ubicacion: i.ubicacion, Cantidad: i.box, Unidad: i.estado_fisico, Guia: i.guia, 'Fecha Entrada': i.fechaEntrada, Usuario: i.usuario })); 
      const ws = XLSX.utils.json_to_sheet(data); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Inventario"); XLSX.writeFile(wb, `Inventario_QRO.xlsx`); 
  };
  
  const exportarHistorial = () => { 
      if (salidas.length === 0) return showAlert("Aviso", "No hay datos", "info"); 
      const data = salidas.map(s => ({ 'Fecha de Salida': s.fechaSalida ? String(s.fechaSalida).split(' ')[0] : '-', 'Item': s.item, 'Serie': s.serie, 'Cantidad': s.box, 'Unidad': s.estado_fisico, 'Fecha de entrada': s.fecha_entrada || '-', 'Usuario': s.usuario, 'Guía': s.guia || '-' })); 
      const ws = XLSX.utils.json_to_sheet(data); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Salidas"); XLSX.writeFile(wb, `Historial_QRO.xlsx`); 
  };

  const handleConfirmNewUser = async (user:string, pass:string, rol:string) => {
      if(!user || !pass) return;
      await supabase.from('perfiles').insert([{ user, pass, rol }]); 
      setModalUsuario(false); fetchUsuarios(); 
  };

  const handleDeleteUser = async (id: number, nombre: string) => { 
      if(nombre === 'ZAHID') return showAlert("Seguridad", "No puedes eliminar al Admin.", "error");
      if (confirm("¿Seguro que deseas eliminar?")) { await supabase.from('perfiles').delete().eq('id', id); fetchUsuarios(); } 
  };

  const handleSaveConfig = async (val: number) => {
      await supabase.from('almacen_config').upsert({ id: 1, total_ubicaciones: val });
      setTotalUbicaciones(val);
      setModalConfig(false);
      showSuccess("Almacén configurado.");
  };

  const getTabs = () => {
      if (isClient) return [{ id: 'inventario', icon: '📦', label: 'Inventario' }, { id: 'salidas', icon: '📤', label: 'Salidas' }, { id: 'graficos', icon: '📊', label: 'Gráficos' }];
      return [{ id: 'inventario', icon: '📦', label: 'Inventario' }, { id: 'entradas', icon: '📥', label: 'Entradas' }, { id: 'salidas', icon: '📤', label: 'Salidas' }, { id: 'graficos', icon: '📊', label: 'Gráficos' }];
  };

  // --- CÁLCULOS PARA GRÁFICOS Y MÉTRICAS (1.20 x 1.10 = 1.32) ---
  const locOcupadas = new Set(inventario.map(i => i.ubicacion)).size; 
  const locLibres = (totalUbicaciones - locOcupadas) > 0 ? (totalUbicaciones - locOcupadas) : 0;
  
  const areaTotal = (totalUbicaciones * 1.32).toFixed(2);
  const areaOcupada = (locOcupadas * 1.32).toFixed(2);
  const percentOcupacion = totalUbicaciones > 0 ? ((locOcupadas / totalUbicaciones) * 100).toFixed(1) : '0';
  
  const pieData = [
      { name: 'Ocupado', value: locOcupadas },
      { name: 'Libre', value: locLibres }
  ];
  const pieColors = ['#1e293b', '#10b981'];

  const barData = [
      { name: 'Unidades', Cajas: inventario.filter(i => i.estado_fisico === 'Cajas').length, Piezas: inventario.filter(i => i.estado_fisico === 'Piezas').length }
  ];

  const trendMap: any = {};
  const entradasUnicas = new Set();

  // Función para registrar Entradas por ubicación única
  const registrarEntrada = (itemObj: any, fechaCampo: string) => {
      const fecha = itemObj[fechaCampo] || 'S/D';
      // Identificador único para cada ubicación física registrada en esa fecha
      const uniqueKey = `${itemObj.item}-${itemObj.serie || ''}-${itemObj.ubicacion}-${fecha}`;
      
      if (!entradasUnicas.has(uniqueKey)) {
          entradasUnicas.add(uniqueKey);
          if (!trendMap[fecha]) trendMap[fecha] = { Ingresos: 0, Salidas: 0, SalidasDetalleObj: {} };
          trendMap[fecha].Ingresos += 1; // Suma 1 ubicación ingresada
      }
  };

  // 1. Contabilizar todas las Entradas
  inventario.forEach(i => registrarEntrada(i, 'fechaEntrada'));
  salidas.forEach(s => registrarEntrada(s, 'fecha_entrada'));

  // 2. Contabilizar las Salidas (Sumando eventos y agrupando cantidades por unidad)
  salidas.forEach(s => {
      const d = s.fechaSalida ? String(s.fechaSalida).split(' ')[0] : 'S/D';
      if (!trendMap[d]) trendMap[d] = { Ingresos: 0, Salidas: 0, SalidasDetalleObj: {} };
      
      trendMap[d].Salidas += 1; // Cuenta 1 evento de salida

      // Agrupa las cantidades según su estado físico (ej. suma todas las Cajas, suma todas las Tarimas)
      const unidad = s.estado_fisico || 'Unidades';
      const cantidad = parseInt(s.box) || 1;
      
      if (!trendMap[d].SalidasDetalleObj[unidad]) trendMap[d].SalidasDetalleObj[unidad] = 0;
      trendMap[d].SalidasDetalleObj[unidad] += cantidad;
  });

  const parseDateChart = (dStr: string) => {
    if(!dStr || dStr === 'S/D') return 0;
    const p = dStr.split('/');
    if(p.length === 3) return new Date(Number(p[2]), Number(p[1])-1, Number(p[0])).getTime();
    return new Date(dStr).getTime() || 0;
};

const today = new Date();
let reportMonthDate = today;
if (today.getDate() >= 27) {
    reportMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
}
const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const currentReportMonthName = monthNames[reportMonthDate.getMonth()];

const startDate = new Date(reportMonthDate.getFullYear(), reportMonthDate.getMonth() - 1, 27).getTime();
const endDate = new Date(reportMonthDate.getFullYear(), reportMonthDate.getMonth(), 26, 23, 59, 59).getTime();

const lineData = Object.keys(trendMap)
    .filter(k => {
        const t = parseDateChart(k);
        return t >= startDate && t <= endDate;
    })
    .sort((a, b) => parseDateChart(a) - parseDateChart(b))
    .map(k => {
        const detObj = trendMap[k].SalidasDetalleObj || {};
        const detallesArr = Object.keys(detObj).map(unidad => `${detObj[unidad]} ${unidad}`);
        return { 
            fecha: k !== 'S/D' ? k.substring(0,5) : 'S/D', 
            Ingresos: trendMap[k].Ingresos, 
            Salidas: trendMap[k].Salidas,
            Detalles: detallesArr
        };
    });

      const CustomTooltipChart = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div style={{ background: 'white', padding: '15px', border: '1px solid #cbd5e1', borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                    <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#1e293b', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Fecha: {label}</p>
                    <p style={{ margin: '5px 0', color: '#10b981', fontWeight: 'bold' }}>Entradas: {data.Ingresos}</p>
                    <p style={{ margin: '5px 0', color: '#ef4444', fontWeight: 'bold' }}>Salidas: {data.Salidas}</p>
                    {data.Salidas > 0 && data.Detalles && data.Detalles.length > 0 && (
                        <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#475569' }}>
                            <strong>Detalle de Salidas:</strong>
                            <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px' }}>
                                {data.Detalles.map((d: string, i: number) => <li key={i}>{d}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };
  // ESTILOS DE INPUTS OSCUROS PARA FORMULARIO
  const darkInputStyle = { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #475569', background: '#334155', color: 'white', fontWeight: 'bold' as const, fontSize: '1rem', boxSizing: 'border-box' as const };

  return (
    <>
      <style>{`
        body, html, #root { margin: 0; padding: 0; width: 100%; height: 100%; max-width: none !important; text-align: left !important; overflow: hidden; background-color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        * { box-sizing: border-box; }
        .glass-container { width: 95%; max-width: 1400px; height: 90vh; background: rgba(255, 255, 255, 0.88); backdrop-filter: blur(20px); border-radius: 25px; display: flex; flex-direction: row; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.6); position: relative; }
        .sidebar-menu { width: 250px; background: rgba(255, 255, 255, 0.5); border-right: 1px solid rgba(0,0,0,0.1); padding: 30px 20px; display: flex; flex-direction: column; overflow-y: auto; }
        .main-content-panel { flex: 1; padding: 40px; overflow-y: auto; position: relative; width: calc(100% - 250px); }
        .recharts-wrapper { font-family: inherit !important; }

        .btn-hero { background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); border: 2px solid rgba(255, 255, 255, 0.4); color: white; font-size: 3rem; font-weight: 900; padding: 40px 100px; border-radius: 50px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 0 15px rgba(255, 255, 255, 0.1); letter-spacing: 5px; text-transform: uppercase; }
        .btn-hero:hover { transform: scale(1.05); background: rgba(255, 255, 255, 0.25); border-color: rgba(255, 255, 255, 1); box-shadow: 0 0 40px rgba(255, 255, 255, 0.8), 0 0 80px rgba(255, 255, 255, 0.5); }
        
        @media (max-width: 768px) {
            .glass-container { flex-direction: column; height: 95vh; border-radius: 15px; }
            .sidebar-menu { width: 100%; padding: 15px; border-right: none; border-bottom: 1px solid rgba(0,0,0,0.1); flex-direction: row; overflow-x: auto; white-space: nowrap; }
            .sidebar-menu h2 { display: none; } 
            .sidebar-menu button { flex: 0 0 auto; margin-bottom: 0 !important; margin-right: 10px; padding: 10px 15px !important; }
            .main-content-panel { width: 100%; padding: 20px; }
            .btn-hero { font-size: 1.8rem !important; padding: 20px 40px !important; }
        }
      `}</style>
      
      <div style={{ minHeight: '100%', width: '100%', position: 'relative', backgroundImage: 'url("/background.png")', backgroundSize: 'cover', backgroundPosition:'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 0 }}></div>
        
        <SuccessModal show={successModal.show} message={successModal.message} onClose={() => setSuccessModal({show:false, message:''})} />
        <AlertModal show={alertInfo.show} title={alertInfo.title} message={alertInfo.message} type={alertInfo.type} onClose={() => setAlertInfo({show:false, title:'', message:'', type:'info'})} />
        <LoginModal show={loginModal.show} type={loginModal.type} creds={loginCreds} setCreds={setLoginCreds} onCancel={() => setLoginModal({show:false, type:'warehouse'})} onSubmit={handleLoginSubmit} />
        <TraceabilityModal show={modalTrazabilidadState.show} data={modalTrazabilidadState.data} onClose={() => setModalTrazabilidadState({show:false, data:null})} />
        <NewUserModal show={modalUsuario} onConfirm={handleConfirmNewUser} onCancel={() => setModalUsuario(false)} />
        <ConfigAlmacenModal show={modalConfig} ubicacionesActuales={totalUbicaciones} onConfirm={handleSaveConfig} onCancel={()=>setModalConfig(false)} />

        {/* MODAL SURTIDO */}
        {modalSurtido.show && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 10001, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter:'blur(5px)' }}>
            <div style={{ background: 'white', padding: '35px', borderRadius: '20px', width: '90%', maxWidth: '400px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', position: 'relative' }}>
              <button onClick={() => setModalSurtido({ show: false })} style={closeBtnStyle}>✖</button>
              <h3 style={{ marginTop: 0, color:'#1e293b', fontSize:'1.5rem', marginBottom:'15px' }}>📦 Extraer Material</h3>
              <div style={{background:'#f8fafc', padding:'15px', borderRadius:'10px', marginBottom:'20px', border:'1px solid #e2e8f0'}}>
                  <p style={{margin:'0 0 5px 0', color:'#64748b'}}>Item: <strong style={{color:'#1e293b'}}>{modalSurtido.item?.item}</strong></p>
                  <p style={{margin:0, color:'#64748b'}}>En stock: <strong style={{color:'#10b981'}}>{modalSurtido.item?.box || 1} {modalSurtido.item?.estado_fisico || 'unidades'}</strong></p>
              </div>
              <div style={{marginBottom:'25px'}}>
                  <label style={{display:'block', fontWeight:'bold', color:'#1e293b', marginBottom:'8px'}}>Cantidad a sacar</label>
                  <input type="number" min="1" max={modalSurtido.item?.box || 1} style={{width: '100%', padding: '14px', borderRadius: '10px', border:'1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box'}} value={formSurtido.cantidad_surtir} onChange={(e: any) => setFormSurtido({cantidad_surtir: parseInt(e.target.value) || 1})} />
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <button onClick={() => setModalSurtido({ show: false })} style={{ flex: 1, padding: '14px', borderRadius: '10px', border:'none', background:'#ef4444', color:'white', fontWeight:'bold', cursor:'pointer', fontSize:'1rem' }}>Cancelar</button>
                <button onClick={confirmarSurtido} style={{ flex: 1, padding: '14px', borderRadius: '10px', background: '#10b981', color: 'white', border:'none', fontWeight:'bold', cursor:'pointer', fontSize:'1rem' }}>Confirmar</button>
              </div>
            </div>
          </div>
        )}

        {scanningField && (
              <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                  <div style={{background: 'white', padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '500px', textAlign: 'center', position: 'relative'}}>
                      <button onClick={() => setScanningField(null)} style={closeBtnStyle}>✖</button>
                      <h3 style={{color: '#1e293b', marginBottom: '15px'}}>Escaneando {scanningField.toUpperCase()}</h3>
                      <div id="reader" style={{width: '100%'}}></div>
                      <button onClick={() => setScanningField(null)} style={{marginTop: '20px', padding: '14px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', width:'100%'}}>Cancelar</button>
                  </div>
              </div>
        )}

        {/* CONTENEDOR PRINCIPAL */}
        <div style={{ zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          
          {view === 'main' && (
            <>
              <button 
                  className="btn-hero"
                  onMouseEnter={() => setHoveredCard('qro')} onMouseLeave={() => setHoveredCard(null)} onClick={() => openLogin('warehouse')}
              >
                  QUERÉTARO
              </button>
              <button style={{position:'fixed', bottom:'20px', left:'20px', opacity:0.4, border:'none', background:'none', cursor:'pointer', fontSize:'1.8rem', zIndex: 50}} onClick={() => openLogin('admin_manage')} title="Admin">👤</button>
            </>
          )}

          {view === 'almacen' && (
            <div className="glass-container">
                <div className="sidebar-menu">
                    <h2 style={{textAlign:'center', color:'#1e293b', marginBottom:'40px', fontSize: '1.8rem', fontWeight: '900'}}>VORTEX</h2>
                    {getTabs().map(t => (
                        <button key={t.id} onClick={()=>setTab(t.id)} style={{ width: '100%', padding: '15px', textAlign: 'left', background: tab === t.id ? '#1e293b' : 'transparent', color: tab === t.id ? 'white' : '#475569', borderRadius: '12px', border: 'none', fontWeight: 'bold', marginBottom: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span style={{fontSize:'1.3rem'}}>{t.icon}</span> {t.label}
                        </button>
                    ))}
                </div>
                <div className="main-content-panel">
                    <button onClick={()=>setView('main')} style={closeBtnStyle} title="Cerrar Sesión">✖</button>
                    
                    {/* INVENTARIO */}
                    {tab === 'inventario' && (
                      <>
                        <div style={{display:'flex', gap:'15px', marginBottom:'25px', alignItems:'center', flexWrap: 'wrap'}}>
                            <input style={{width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '1rem', flex:1, minWidth: '200px', color:'#1e293b'}} placeholder="🔍 Buscar por Item o Serie..." value={searchTerm} onChange={(e: any) => setSearchTerm(e.target.value)} />
                            {!isClient && (
                                <div onClick={() => setModoEdicionUbicacion(!modoEdicionUbicacion)} style={{cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'0 10px'}}>
                                    <span style={{fontSize:'0.7rem', color:'#1e293b', fontWeight:'bold'}}>EDITAR UBIC</span>
                                    <span style={{fontSize:'1.5rem'}}>{modoEdicionUbicacion ? '✏️' : '🔒'}</span>
                                </div>
                            )}
                            <button onClick={exportarInventario} style={{padding:'14px 25px', background:'#059669', color:'white', border:'none', borderRadius:'10px', fontWeight:'bold', cursor:'pointer', whiteSpace: 'nowrap'}}>📥 Exportar</button>
                        </div>
                        <div style={{maxHeight: '65vh', overflowY: 'auto', overflowX: 'auto', borderRadius: '15px', background: 'white', border: '1px solid #e2e8f0'}}>
                            <table style={{width:'100%', minWidth: '700px', borderCollapse:'collapse'}}>
                              <thead>
                                <tr>
                                  <th style={{color: '#0f172a', fontWeight: '800', borderBottom: '2px solid #1e293b', padding: '15px 10px', textAlign: 'left', position: 'sticky', top: 0, background: '#f8fafc'}}>Item</th>
                                  <th style={{color: '#0f172a', fontWeight: '800', borderBottom: '2px solid #1e293b', padding: '15px 10px', textAlign: 'left', position: 'sticky', top: 0, background: '#f8fafc'}}>Serie</th>
                                  <th style={{color: '#0f172a', fontWeight: '800', borderBottom: '2px solid #1e293b', padding: '15px 10px', textAlign: 'left', position: 'sticky', top: 0, background: '#f8fafc'}}>Fecha Ingreso</th>
                                  <th style={{color: '#0f172a', fontWeight: '800', borderBottom: '2px solid #1e293b', padding: '15px 10px', textAlign: 'left', position: 'sticky', top: 0, background: '#f8fafc'}}>Ubicación</th>
                                  <th style={{color: '#0f172a', fontWeight: '800', borderBottom: '2px solid #1e293b', padding: '15px 10px', textAlign: 'left', position: 'sticky', top: 0, background: '#f8fafc'}}>Cantidad</th>
                                  <th style={{color: '#0f172a', fontWeight: '800', borderBottom: '2px solid #1e293b', padding: '15px 10px', textAlign: 'left', position: 'sticky', top: 0, background: '#f8fafc'}}>Unidad</th>
                                  <th style={{color: '#0f172a', fontWeight: '800', borderBottom: '2px solid #1e293b', padding: '15px 10px', textAlign: 'left', position: 'sticky', top: 0, background: '#f8fafc'}}>Acción</th>
                                </tr>
                              </thead>
                              <tbody>
                                {inventario.filter(i => String(i.item || '').toLowerCase().includes(searchTerm.toLowerCase()) || String(i.serie || '').toLowerCase().includes(searchTerm.toLowerCase())).map(i => (
                                  <tr key={i.id} style={{borderBottom: '1px solid #eee', transition: '0.2s'}} onMouseOver={(e: React.MouseEvent<HTMLTableRowElement>) => (e.currentTarget as HTMLTableRowElement).style.background='#f1f5f9'} onMouseOut={(e: React.MouseEvent<HTMLTableRowElement>) => (e.currentTarget as HTMLTableRowElement).style.background='transparent'}>
                                    <td style={{color: '#334155', padding: '12px 10px'}}><strong>{i.item}</strong></td>
                                    <td style={{color: '#334155', padding: '12px 10px'}}>{i.serie}</td>
                                    <td style={{color: '#334155', padding: '12px 10px'}}>{i.fechaEntrada || 'S/D'}</td>
                                    <td style={{color: '#334155', padding: '12px 10px'}}>{modoEdicionUbicacion && !isClient ? <input value={i.ubicacion} style={{width: '80px', padding: '8px', borderRadius: '8px', border: '2px solid #3b82f6'}} onChange={(e: any) => handleUpdateUbicacionRapid(i.id, 'ubicacion', e.target.value)} onBlur={(e: any) => handleSaveUbicacionHistory(i.id, 'ubicacion', e.target.value, i.ubicacion)} /> : i.ubicacion}</td>
                                    <td style={{color: '#334155', padding: '12px 10px'}}>{modoEdicionUbicacion && !isClient ? <input type="number" value={i.box || ''} style={{width: '80px', padding: '8px', borderRadius: '8px', border: '2px solid #3b82f6'}} onChange={(e: any) => handleUpdateUbicacionRapid(i.id, 'box', e.target.value)} onBlur={(e: any) => handleSaveUbicacionHistory(i.id, 'box', e.target.value, i.box || '')} /> : (i.box || '1')}</td>
                                    <td style={{color: '#10b981', padding: '12px 10px', fontWeight:'bold'}}>{i.estado_fisico}</td>
                                    <td style={{padding: '12px 10px'}}>
                                        <div style={{display:'flex', gap:'10px'}}>
                                            <button onClick={() => setModalTrazabilidadState({ show:true, data: i })} style={{border:'none', background:'#cbd5e1', color: '#1e293b', borderRadius:'8px', padding:'8px 12px', cursor:'pointer', fontWeight:'bold'}}>Ver</button>
                                            {!isClient && <button onClick={() => abrirModalSurtido(i)} style={{background:'#ef4444', color:'white', border:'none', padding:'8px 15px', borderRadius:'8px', cursor:'pointer', fontWeight:'bold'}}>Surtir</button>}
                                        </div>
                                    </td>
                                  </tr>
                                ))}
                                {inventario.length === 0 && <tr><td colSpan={7} style={{textAlign:'center', padding:'30px', color:'#94a3b8'}}>No hay registros en el inventario.</td></tr>}
                              </tbody>
                            </table>
                        </div>
                      </>
                    )}

                    {/* ENTRADAS */}
                    {tab === 'entradas' && !isClient && (
                      <div style={{display:'flex', gap:'30px', width:'100%', flexWrap:'wrap'}}>
                          <div style={{flex: '2', minWidth: '300px', background: 'white', padding: '30px', borderRadius: '20px', border: '1px solid #e2e8f0'}}>
                              <h3 style={{margin:0, color:'#1e293b', marginBottom: '20px', fontSize: '1.5rem'}}>Registro Manual</h3>
                              
                              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px'}}>
                                  <div>
                                      <label style={{fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#475569'}}>Item</label>
                                      <div style={{display: 'flex', gap: '5px'}}>
                                          <input style={darkInputStyle} value={form.item} onChange={(e: any) => setForm({...form, item:e.target.value})} required />
                                          <button type="button" onClick={() => setScanningField('item')} style={{padding: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer'}}>📷</button>
                                      </div>
                                  </div>
                                  <div>
                                      <label style={{fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#475569'}}>Serie</label>
                                      <div style={{display: 'flex', gap: '5px'}}>
                                          <input style={darkInputStyle} value={form.serie} onChange={(e: any) => setForm({...form, serie:e.target.value})} />
                                          <button type="button" onClick={() => setScanningField('serie')} style={{padding: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer'}}>📷</button>
                                      </div>
                                  </div>
                                  <div>
                                      <label style={{fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#475569'}}>Ubicación</label>
                                      <input style={darkInputStyle} value={form.ubicacion} onChange={(e: any) => setForm({...form, ubicacion:e.target.value})} required />
                                  </div>
                                  <div>
                                      <label style={{fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#475569'}}>Cantidad</label>
                                      <input type="number" min="1" style={darkInputStyle} value={form.box} onChange={(e: any) => setForm({...form, box:e.target.value})} required />
                                  </div>
                                  <div>
                                      <label style={{fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#475569'}}>Unidad</label>
                                      <select style={darkInputStyle} value={form.estado_fisico} onChange={(e: any) => setForm({...form, estado_fisico: e.target.value})}>
                                          <option value="Cajas">Cajas</option>
                                          <option value="Piezas">Piezas</option>
                                      </select>
                                  </div>
                                  <div>
                                      <label style={{fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#059669'}}>Guía Opcional</label>
                                      <input style={{width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #10b981', background: '#f0fdf4', color: '#1e293b', boxSizing: 'border-box'}} value={form.guia} onChange={(e: any) => setForm({...form, guia:e.target.value})} placeholder="Opcional" />
                                  </div>
                              </div>
                              <button onClick={handleInsertEntrada} style={{width:'100%', padding:'18px', background:'#1e293b', color:'white', border:'none', borderRadius:'12px', fontWeight:'bold', fontSize:'1.2rem', cursor:'pointer', marginTop:'25px'}}>Guardar Entrada</button>
                          </div>
                          
                          <div style={{flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: '3px dashed #cbd5e1', borderRadius: '20px', background: isDragging ? '#e0f2fe' : 'rgba(255,255,255,0.5)', transition: '0.3s', padding: '40px', textAlign: 'center'}} onDragOver={(e: any)=>{e.preventDefault(); setIsDragging(true)}} onDragLeave={()=>setIsDragging(false)} onDrop={(e: any)=>{e.preventDefault(); setIsDragging(false); processFileComplete(e.dataTransfer.files[0])}}>
                              <div style={{fontSize:'4rem', marginBottom:'10px'}}>📊</div>
                              <h2 style={{color:'#1e293b', margin:'0 0 15px 0'}}>Importación Masiva</h2>
                              <div style={{color:'#64748b', fontSize:'0.95rem', marginBottom:'30px', lineHeight:'1.8', display:'flex', flexDirection:'column', gap:'5px'}}>
                                  <span><b>Columna A:</b> Item</span>
                                  <span><b>Columna B:</b> Serie</span>
                                  <span><b>Columna C:</b> Ubicación</span>
                                  <span><b>Columna D:</b> Cantidad</span>
                                  <span><b>Columna E:</b> Unidad (Cajas/Piezas)</span>
                              </div>
                              <label style={{padding:'12px 25px', background:'#3b82f6', color:'white', borderRadius:'10px', cursor:'pointer', fontWeight:'bold', fontSize:'1.1rem'}}>
                                  Seleccionar Archivo<input type="file" style={{display:'none'}} onChange={(e: any)=>processFileComplete(e.target.files![0])}/>
                              </label>
                          </div>
                      </div>
                    )}

                    {/* SALIDAS */}
                    {tab === 'salidas' && (
                      <>
                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px', alignItems:'center'}}>
                            <h2 style={{margin:0, color:'#1e293b'}}>Historial de Salidas</h2>
                            <button onClick={exportarHistorial} style={{padding:'12px 25px', background:'#059669', color:'white', borderRadius:'10px', border:'none', cursor:'pointer', fontWeight:'bold'}}>📥 Exportar a Excel</button>
                        </div>
                        <div style={{maxHeight: '65vh', overflowY: 'auto', overflowX: 'auto', borderRadius: '15px', background: 'white', border: '1px solid #e2e8f0'}}>
                            <table style={{width:'100%', minWidth: '700px', borderCollapse:'collapse'}}>
                                <thead>
                                    <tr>
                                        <th style={{color: '#0f172a', fontWeight: '800', borderBottom: '2px solid #1e293b', padding: '15px 10px', textAlign: 'left', position: 'sticky', top: 0, background: '#f8fafc'}}>Item</th>
                                        <th style={{color: '#0f172a', fontWeight: '800', borderBottom: '2px solid #1e293b', padding: '15px 10px', textAlign: 'left', position: 'sticky', top: 0, background: '#f8fafc'}}>Serie</th>
                                        <th style={{color: '#0f172a', fontWeight: '800', borderBottom: '2px solid #1e293b', padding: '15px 10px', textAlign: 'left', position: 'sticky', top: 0, background: '#f8fafc'}}>Fecha Salida</th>
                                        <th style={{color: '#0f172a', fontWeight: '800', borderBottom: '2px solid #1e293b', padding: '15px 10px', textAlign: 'left', position: 'sticky', top: 0, background: '#f8fafc'}}>Cantidad</th>
                                        <th style={{color: '#0f172a', fontWeight: '800', borderBottom: '2px solid #1e293b', padding: '15px 10px', textAlign: 'left', position: 'sticky', top: 0, background: '#f8fafc'}}>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {salidas.map(s => (
                                        <tr key={s.id} style={{borderBottom:'1px solid #eee'}}>
                                            <td style={{color: '#334155', padding: '12px 10px'}}><strong>{s.item}</strong></td>
                                            <td style={{color: '#334155', padding: '12px 10px'}}>{s.serie}</td>
                                            <td style={{color: '#334155', padding: '12px 10px'}}>{s.fechaSalida ? String(s.fechaSalida).split(' ')[0] : '-'}</td>
                                            <td style={{color: '#334155', padding: '12px 10px'}}>{s.box} {s.estado_fisico}</td>
                                            <td style={{color: '#334155', padding: '12px 10px'}}><button onClick={() => setModalTrazabilidadState({ show:true, data: s })} style={{background:'#cbd5e1', border:'none', cursor:'pointer', padding:'8px 15px', borderRadius:'8px', fontWeight:'bold', color: '#1e293b'}}>Ver</button></td>
                                        </tr>
                                    ))}
                                    {salidas.length === 0 && <tr><td colSpan={5} style={{textAlign:'center', padding:'30px', color:'#94a3b8'}}>No hay salidas registradas.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                      </>
                    )}

                    {/* GRÁFICOS (RECHARTS + MÉTRICAS FÍSICAS) */}
                    {tab === 'graficos' && (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '30px'}}>
                            {/* Panel Metricas de Ocupacion */}
                            <div style={{background: 'white', padding: '25px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'}}>
                                <h2 style={{color:'#1e293b', marginTop: 0, marginBottom: '20px'}}>Métricas de Ocupación del Almacén</h2>
                                <div style={{overflowX: 'auto'}}>
                                    <table style={{width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'center'}}>
                                        <thead>
                                            <tr style={{background: '#f8fafc', borderBottom: '2px solid #1e293b'}}>
                                                <th style={{padding: '15px', color: '#475569'}}>Total Ubicaciones</th>
                                                <th style={{padding: '15px', color: '#10b981'}}>Ocupadas</th>
                                                <th style={{padding: '15px', color: '#ef4444'}}>Libres</th>
                                                <th style={{padding: '15px', color: '#475569'}}>Área Total (m²)</th>
                                                <th style={{padding: '15px', color: '#3b82f6'}}>Área Ocupada (m²)</th>
                                                <th style={{padding: '15px', color: '#1e293b'}}>% Ocupación</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td style={{padding: '15px', fontSize: '1.2rem', fontWeight: 'bold'}}>{totalUbicaciones}</td>
                                                <td style={{padding: '15px', fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981'}}>{locOcupadas}</td>
                                                <td style={{padding: '15px', fontSize: '1.2rem', fontWeight: 'bold', color: '#ef4444'}}>{locLibres}</td>
                                                <td style={{padding: '15px', fontSize: '1.2rem', fontWeight: 'bold'}}>{areaTotal}</td>
                                                <td style={{padding: '15px', fontSize: '1.2rem', fontWeight: 'bold', color: '#3b82f6'}}>{areaOcupada}</td>
                                                <td style={{padding: '15px', fontSize: '1.5rem', fontWeight: '900', color: '#1e293b'}}>{percentOcupacion}%</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Graficos Recharts */}
                            <div style={{display:'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap:'20px'}}>
                                <div style={{background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0', height: '300px', display: 'flex', flexDirection: 'column'}}>
                                    <h3 style={{margin: '0 0 10px 0', textAlign: 'center', color: '#475569'}}>Distribución del Espacio</h3>
                                    <div style={{flex: 1}}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />)}
                                                </Pie>
                                                <RechartsTooltip />
                                                <RechartsLegend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div style={{background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0', height: '300px', display: 'flex', flexDirection: 'column'}}>
                                    <h3 style={{margin: '0 0 10px 0', textAlign: 'center', color: '#475569'}}>Almacenamiento por Unidad</h3>
                                    <div style={{flex: 1}}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                                <XAxis dataKey="name" tick={false} />
                                                <YAxis allowDecimals={false} />
                                                <RechartsTooltip cursor={{fill: 'transparent'}}/>
                                                <RechartsLegend />
                                                <Bar dataKey="Cajas" fill="#3b82f6" radius={[5, 5, 0, 0]} barSize={40} />
                                                <Bar dataKey="Piezas" fill="#f59e0b" radius={[5, 5, 0, 0]} barSize={40} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                
                                <div style={{background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0', height: '300px', display: 'flex', flexDirection: 'column', gridColumn: '1 / -1'}}>
                                <h3 style={{margin: '0 0 10px 0', textAlign: 'center', color: '#475569'}}>Tendencia de Entradas y Salidas <span style={{color: '#3b82f6', fontSize: '0.8em', marginLeft: '10px'}}>Mes corriente ({currentReportMonthName})</span></h3>
                                    <div style={{flex: 1}}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={lineData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                                <XAxis dataKey="fecha" />
                                                <YAxis allowDecimals={false} />
                                                <RechartsTooltip content={<CustomTooltipChart />} />
                                                <Line type="monotone" dataKey="Ingresos" stroke="#10b981" strokeWidth={3} dot={{r: 6}} activeDot={{r: 8}} />
                                                <Line type="monotone" dataKey="Salidas" stroke="#ef4444" strokeWidth={3} dot={{r: 6}} activeDot={{r: 8}} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
          )}

          {/* ADMIN */}
          {view === 'admin' && (
              <div style={{background:'rgba(255, 255, 255, 0.95)', padding:'40px', borderRadius:'25px', width:'95%', maxWidth:'800px', position: 'relative', boxShadow:'0 25px 50px rgba(0,0,0,0.5)'}}>
                  <button onClick={() => setView('main')} style={closeBtnStyle}>✖</button>
                  <h2 style={{color:'#1e293b', marginBottom: '30px', marginTop:0}}>Panel de Administración</h2>
                  
                  <div style={{display:'flex', gap:'15px', marginBottom:'25px', flexWrap:'wrap'}}>
                      <button onClick={()=>setModalUsuario(true)} style={{background:'#10b981', color:'white', border:'none', padding:'12px 25px', borderRadius:'10px', cursor:'pointer', fontWeight:'bold', fontSize:'1rem'}}>+ Nuevo Usuario</button>
                      <button onClick={()=>setModalConfig(true)} style={{background:'#1e293b', color:'white', border:'none', padding:'12px 25px', borderRadius:'10px', cursor:'pointer', fontWeight:'bold', fontSize:'1rem'}}>⚙️ Configurar Almacén</button>
                  </div>
                  
                  <div style={{overflowX: 'auto', borderRadius: '15px', border: '1px solid #e2e8f0'}}>
                      <table style={{width:'100%', minWidth: '500px', borderCollapse: 'collapse', background: 'white'}}>
                          <thead>
                              <tr>
                                  <th style={{color: '#0f172a', fontWeight: '800', borderBottom: '2px solid #1e293b', padding: '15px 10px', textAlign: 'left', background: '#f8fafc'}}>Nombre</th>
                                  <th style={{color: '#0f172a', fontWeight: '800', borderBottom: '2px solid #1e293b', padding: '15px 10px', textAlign: 'left', background: '#f8fafc'}}>Rol</th>
                                  <th style={{color: '#0f172a', fontWeight: '800', borderBottom: '2px solid #1e293b', padding: '15px 10px', textAlign: 'left', background: '#f8fafc'}}>Acción</th>
                              </tr>
                          </thead>
                          <tbody>
                              {usuariosDB.map(u => (
                                  <tr key={u.id} style={{borderBottom:'1px solid #eee'}}>
                                      <td style={{color: '#334155', padding: '12px 10px'}}><strong>{u.user}</strong></td>
                                      <td style={{color: '#334155', padding: '12px 10px'}}><span style={{background:'#e0f2fe', color:'#0369a1', padding:'5px 10px', borderRadius:'10px', fontSize:'0.8rem', fontWeight:'bold'}}>{u.rol}</span></td>
                                      <td style={{color: '#334155', padding: '12px 10px'}}>{u.user !== 'ZAHID' && <button onClick={()=>handleDeleteUser(u.id, u.user)} style={{color:'white', border:'none', background:'#ef4444', padding:'8px 15px', borderRadius:'8px', cursor:'pointer', fontWeight:'bold'}}>Eliminar</button>}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          )}
        </div>
      </div>
    </>
  );
}