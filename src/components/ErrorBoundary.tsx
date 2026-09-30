import React from 'react';
export class ErrorBoundary extends React.Component<{children:React.ReactNode},{failed:boolean}> {
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 componentDidCatch(error:Error){console.error('Application error:',error);}
 render(){return this.state.failed ? <div role="alert" className="p-6 text-center"><h1 className="font-bold">Unable to open this screen</h1><p>Please reload and try again.</p><button className="mt-4 p-3 bg-red-700 text-white rounded-xl" onClick={()=>location.reload()}>Reload</button></div> : this.props.children;}
}
