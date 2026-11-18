import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { CRUD_BY_SLUG, CrudDef, FieldDef } from '../cruds.catalog';

@Component({
  selector: 'app-crud-generic',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './crud-generic.component.html',
  styleUrl: './crud-generic.component.scss'
})
export class CrudGenericComponent {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  back() { this.location.back(); }

  def = signal<CrudDef | null>(null);
  items = signal<any[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  form = signal<Record<string, any>>({});

  // Opciones cargadas para campos tipo 'ref'/'multiref' (FK), indexadas por field.key
  refOptions = signal<Record<string, any[]>>({});

  // Filas de la tabla de union actualmente cargadas para campos 'multiref', indexadas por field.key
  multiRefJoins = signal<Record<string, any[]>>({});

  // Para la columna de tabla: ids seleccionados de 'multiref' por owner id, indexadas por field.key
  multiRefColumnIds = signal<Record<string, Record<number, number[]>>>({});

  // Estado del buscador RENIEC embebido
  reniecDni = signal('');
  reniecLoading = signal(false);
  reniecResult = signal<{nombres: string|null, apellidoPaterno: string|null, apellidoMaterno: string|null, nombreCompleto: string|null, encontrado: boolean, fuente: string} | null>(null);
  reniecError = signal<string | null>(null);

  // Estado del dropzone de archivos (solo UI, no hay endpoint de upload real)
  fileDragOver = signal(false);

  listedFields = computed<FieldDef[]>(() => (this.def()?.fields ?? []).filter(f => f.listed));
  editableFields = computed<FieldDef[]>(() => (this.def()?.fields ?? []).filter(f => f.editable !== false));

  // Tabs UI: varios CrudDef relacionados (ej. catálogo + su tabla de uso) se muestran
  // como una sola pantalla con pestañas, sin fusionar nada en backend.
  tabOptions = computed<CrudDef[]>(() => {
    const group = this.def()?.tabGroup;
    if (!group || group.length < 2) return [];
    return group.map(s => CRUD_BY_SLUG.get(s)).filter((d): d is CrudDef => !!d);
  });

  selectTab(d: CrudDef) {
    if (d.slug === this.def()?.slug) return;
    this.def.set(d);
    this.showForm.set(false);
    this.load();
    this.resetForm();
    this.loadRefOptions(d);
  }

  constructor() {
    this.route.paramMap.subscribe(p => {
      const slug = p.get('slug');
      const d = slug ? CRUD_BY_SLUG.get(slug) : null;
      this.def.set(d ?? null);
      if (d) { this.load(); this.resetForm(); this.loadRefOptions(d); }
    });
  }

  loadRefOptions(d: CrudDef) {
    for (const field of d.fields) {
      const path = field.type === 'ref' ? field.refPath : field.type === 'multiref' ? field.multiRef?.refPath : null;
      if (!path) continue;
      this.api.list<any>(path).subscribe({
        next: r => this.refOptions.update(m => ({ ...m, [field.key]: Array.isArray(r) ? r : [] })),
        error: () => this.refOptions.update(m => ({ ...m, [field.key]: [] }))
      });
    }
  }

  refLabel(field: FieldDef, id: any): string {
    if (id === null || id === undefined || id === '') return '—';
    const opt = (this.refOptions()[field.key] ?? []).find(o => o.id === id);
    return opt ? String(opt[field.refLabelKey ?? 'nombre']) : String(id);
  }

  load() {
    const d = this.def(); if (!d) return;
    this.loading.set(true); this.error.set(null);
    this.api.list<any>(d.path).subscribe({
      next: r => { this.items.set(Array.isArray(r) ? r : []); this.loading.set(false); this.loadMultiRefColumns(d); },
      error: e => { this.error.set(this.msg(e)); this.loading.set(false); }
    });
  }

  private loadMultiRefColumns(d: CrudDef) {
    for (const field of d.fields) {
      const mr = field.multiRef; if (!mr) continue;
      this.api.list<any>(mr.joinPath).subscribe({
        next: rows => {
          const list = Array.isArray(rows) ? rows : [];
          const byOwner: Record<number, number[]> = {};
          for (const row of list) {
            const owner = row[mr.ownerKey];
            (byOwner[owner] ??= []).push(row[mr.valueKey]);
          }
          this.multiRefColumnIds.update(m => ({ ...m, [field.key]: byOwner }));
        },
        error: () => this.multiRefColumnIds.update(m => ({ ...m, [field.key]: {} }))
      });
    }
  }

  resetForm() {
    const d = this.def(); if (!d) return;
    const empty: Record<string, any> = {};
    for (const field of d.fields) {
      if (field.editable === false) continue;
      if (field.type === 'multiref') { empty[field.key] = []; continue; }
      empty[field.key] = field.default ?? (field.type === 'boolean' ? false : field.type === 'number' || field.type === 'decimal' ? null : '');
    }
    this.form.set(empty);
    this.editingId.set(null);
    this.multiRefJoins.set({});
  }

  openCreate() {
    this.resetForm();
    this.resetReniec();
    this.showForm.set(true);
  }

  resetReniec() {
    this.reniecDni.set('');
    this.reniecResult.set(null);
    this.reniecError.set(null);
    this.reniecLoading.set(false);
  }

  openEdit(row: any) {
    const d = this.def(); if (!d) return;
    const data: Record<string, any> = {};
    for (const field of d.fields) {
      if (field.type === 'ref') {
        const nested = field.refResponseKey ? row[field.refResponseKey] : null;
        data[field.key] = row[field.key] ?? nested?.id ?? null;
      } else if (field.type === 'multiref') {
        data[field.key] = [];
      } else {
        data[field.key] = row[field.key] ?? null;
      }
    }
    this.form.set(data);
    this.editingId.set(row.id ?? null);
    this.showForm.set(true);
    this.loadMultiRefJoins(d, row.id);
  }

  private loadMultiRefJoins(d: CrudDef, ownerId: number) {
    for (const field of d.fields) {
      const mr = field.multiRef; if (!mr) continue;
      this.api.list<any>(`${mr.joinPath}?${mr.ownerKey}=${ownerId}`).subscribe({
        next: rows => {
          const list = Array.isArray(rows) ? rows : [];
          this.multiRefJoins.update(m => ({ ...m, [field.key]: list }));
          this.form.update(f => ({ ...f, [field.key]: list.map(r => r[mr.valueKey]) }));
        },
        error: () => this.multiRefJoins.update(m => ({ ...m, [field.key]: [] }))
      });
    }
  }

  toggleMultiRef(field: FieldDef, id: number, checked: boolean) {
    this.form.update(f => {
      const cur: number[] = f[field.key] ?? [];
      const next = checked ? [...cur, id] : cur.filter(v => v !== id);
      return { ...f, [field.key]: next };
    });
  }

  buscarReniec() {
    const dni = (this.reniecDni() || '').trim();
    if (!/^\d{8}$/.test(dni)) {
      this.reniecError.set('DNI debe tener 8 dígitos.');
      this.reniecResult.set(null);
      return;
    }
    this.reniecError.set(null);
    this.reniecLoading.set(true);
    this.api.get<any>(`/api/v1/admision/reniec/${dni}`).subscribe({
      next: r => {
        this.reniecResult.set(r);
        this.reniecLoading.set(false);
        if (!r.encontrado) this.reniecError.set(`No se encontraron datos (${r.fuente}).`);
      },
      error: e => {
        this.reniecLoading.set(false);
        this.reniecError.set(`Error RENIEC: ${e.status ?? ''} ${e.message ?? ''}`);
      }
    });
  }

  save() {
    const d = this.def(); if (!d) return;
    const body = { ...this.form() };
    const multiRefFields = d.fields.filter(fi => fi.type === 'multiref');
    // quitar campos virtuales (empiezan con __) y vacios
    for (const k of Object.keys(body)) {
      if (k.startsWith('__') || body[k] === '' || body[k] === null) delete body[k];
    }
    const id = this.editingId();
    const req = id ? this.api.put<any>(`${d.path}/${id}`, body) : this.api.post<any>(d.path, body);
    req.subscribe({
      next: saved => {
        if (id) {
          this.items.update(a => a.map(x => x.id === id ? saved : x));
        } else {
          this.items.update(a => [saved, ...a]);
        }
        this.syncMultiRefFields(multiRefFields, saved.id);
        this.showForm.set(false);
        this.error.set(null);
      },
      error: e => this.error.set(this.msg(e))
    });
  }

  private syncMultiRefFields(fields: FieldDef[], ownerId: number) {
    for (const field of fields) {
      const mr = field.multiRef; if (!mr) continue;
      const selected: number[] = this.form()[field.key] ?? [];
      const existing: any[] = this.multiRefJoins()[field.key] ?? [];
      const existingValueIds = existing.map(r => r[mr.valueKey]);
      const toAdd = selected.filter(v => !existingValueIds.includes(v));
      const toDelete = existing.filter(r => !selected.includes(r[mr.valueKey]));
      for (const v of toAdd) {
        this.api.post<any>(mr.joinPath, { [mr.ownerKey]: ownerId, [mr.valueKey]: v }).subscribe({ error: () => {} });
      }
      for (const r of toDelete) {
        this.api.delete<any>(`${mr.joinPath}/${r.id}`).subscribe({ error: () => {} });
      }
      // Actualizar de inmediato la columna de la tabla, sin esperar respuesta del servidor.
      this.multiRefColumnIds.update(m => ({ ...m, [field.key]: { ...(m[field.key] ?? {}), [ownerId]: selected } }));
    }
  }

  updateField(key: string, value: any) {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  // Para campos 'ref' con suggestOnChange: sugiere un valor en otro campo sin sobrescribir lo que el usuario ya eligió.
  onRefChange(field: FieldDef, value: any) {
    this.updateField(field.key, value);
    const suggest = field.suggestOnChange;
    if (!suggest || value === null) return;
    const current = this.form()[suggest.targetKey];
    if (current !== null && current !== undefined && current !== '') return;
    const chosen = (this.refOptions()[field.key] ?? []).find(o => o.id === value);
    const chosenLabel = chosen ? String(chosen[field.refLabelKey ?? 'nombre']) : null;
    const targetLabel = chosenLabel ? suggest.labelMap[chosenLabel] : null;
    if (!targetLabel) return;
    const targetOption = (this.refOptions()[suggest.targetKey] ?? []).find(o => String(o['nombre']) === targetLabel);
    if (targetOption) this.updateField(suggest.targetKey, targetOption.id);
  }

  private applyPickedFile(file: File | undefined, field: FieldDef) {
    if (!file) return;
    this.updateField(field.key, file.name);
    if (field.fileNameTarget) this.updateField(field.fileNameTarget, file.name);
    if (field.fileUrlTarget) this.updateField(field.fileUrlTarget, URL.createObjectURL(file));
  }

  onFileSelected(ev: Event, field: FieldDef) {
    const file = (ev.target as HTMLInputElement).files?.[0];
    this.applyPickedFile(file, field);
  }

  onFileDrop(ev: DragEvent, field: FieldDef) {
    ev.preventDefault();
    this.fileDragOver.set(false);
    const file = ev.dataTransfer?.files?.[0];
    this.applyPickedFile(file, field);
  }

  multiRefLabels(row: any, field: FieldDef): string[] {
    const mr = field.multiRef; if (!mr) return [];
    const ids = this.multiRefColumnIds()[field.key]?.[row.id] ?? [];
    const opts = this.refOptions()[field.key] ?? [];
    return ids.map(id => {
      const opt = opts.find(o => o.id === id);
      return opt ? String(opt[mr.refLabelKey ?? 'nombre']) : String(id);
    });
  }

  fmtCell(row: any, field: FieldDef) {
    if (field.type === 'ref') {
      const nested = field.refResponseKey ? row[field.refResponseKey] : null;
      if (nested) return nested[field.refLabelKey ?? 'nombre'] ?? '—';
      return this.refLabel(field, row[field.key]);
    }
    if (field.type === 'multiref') {
      const labels = this.multiRefLabels(row, field);
      return labels.length ? labels.join(', ') : '—';
    }
    const v = row[field.key];
    if (v === null || v === undefined || v === '') return '—';
    if (typeof v === 'object') return JSON.stringify(v).slice(0, 40);
    return String(v);
  }

  deleteRow(row: any) {
    const d = this.def(); if (!d) return;
    if (!confirm(`¿Eliminar el registro #${row.id}?`)) return;
    this.api.delete<any>(`${d.path}/${row.id}`).subscribe({
      next: () => this.items.update(a => a.filter(x => x.id !== row.id)),
      error: e => this.error.set(this.msg(e))
    });
  }

  private msg(e: any): string {
    const s = e.status ?? '';
    const m = e.error?.message ?? e.error?.detail ?? e.message ?? 'Error';
    return `${s} ${m}`.trim();
  }
}
