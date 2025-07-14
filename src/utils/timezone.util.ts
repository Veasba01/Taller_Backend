/**
 * Utilidades para el manejo de zonas horarias
 * Específicamente configurado para Costa Rica (UTC-6)
 */

export class TimezoneUtil {
  // Zona horaria de Costa Rica (UTC-6)
  private static readonly COSTA_RICA_TIMEZONE = 'America/Costa_Rica';
  
  /**
   * Obtiene la fecha actual en la zona horaria de Costa Rica
   */
  static getCurrentCostaRicaDate(): Date {
    const now = new Date();
    // Costa Rica está en UTC-6, así que restamos 6 horas
    const costaRicaTime = new Date(now.getTime() - (6 * 60 * 60 * 1000));
    return costaRicaTime;
  }

  /**
   * Convierte una fecha string a Date considerando la zona horaria de Costa Rica
   */
  static parseCostaRicaDate(fechaString: string): Date {
    const fecha = new Date(fechaString);
    // Si la fecha no incluye hora, asumimos que es en zona horaria local (Costa Rica)
    if (fechaString.includes('T') || fechaString.includes(' ')) {
      return fecha;
    }
    // Para fechas sin hora, crear la fecha en zona horaria de Costa Rica
    const [year, month, day] = fechaString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  /**
   * Obtiene el rango de inicio y fin de día para una fecha en zona horaria de Costa Rica
   */
  static getDayRange(fecha: Date): { inicioDia: Date; finDia: Date } {
    const inicioDia = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 0, 0, 0, 0);
    const finDia = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + 1, 0, 0, 0, 0);
    return { inicioDia, finDia };
  }

  /**
   * Obtiene el rango de la semana para una fecha en zona horaria de Costa Rica
   */
  static getWeekRange(fecha: Date): { inicioSemana: Date; finSemana: Date } {
    const dia = fecha.getDay();
    const diferencia = dia === 0 ? 6 : dia - 1; // Lunes como primer día de la semana
    const inicioSemana = new Date(fecha);
    inicioSemana.setDate(fecha.getDate() - diferencia);
    inicioSemana.setHours(0, 0, 0, 0);

    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 7);

    return { inicioSemana, finSemana };
  }

  /**
   * Obtiene el rango del mes para una fecha en zona horaria de Costa Rica
   */
  static getMonthRange(fecha: Date): { inicioMes: Date; finMes: Date } {
    const inicioMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
    const finMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 1);
    return { inicioMes, finMes };
  }

  /**
   * Formatea una fecha para mostrar en Costa Rica
   */
  static formatCostaRicaDate(fecha: Date): string {
    return fecha.toLocaleString('es-CR', { 
      timeZone: this.COSTA_RICA_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  /**
   * Formatea una fecha para mostrar solo la fecha (sin hora) en Costa Rica
   */
  static formatCostaRicaDateOnly(fecha: Date): string {
    return fecha.toLocaleDateString('es-CR', { 
      timeZone: this.COSTA_RICA_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  /**
   * Obtiene información de debug sobre la zona horaria
   */
  static getTimezoneInfo(): { 
    serverTime: string;
    costaRicaTime: string;
    costaRicaDate: string;
    timezoneOffset: number;
  } {
    const now = new Date();
    const costaRicaTime = this.getCurrentCostaRicaDate();
    const serverTime = now.toISOString();
    const costaRicaTimeStr = costaRicaTime.toISOString();
    const costaRicaDateStr = costaRicaTime.toISOString().split('T')[0];
    const timezoneOffset = now.getTimezoneOffset();
    
    return {
      serverTime,
      costaRicaTime: costaRicaTimeStr,
      costaRicaDate: costaRicaDateStr,
      timezoneOffset
    };
  }
}
